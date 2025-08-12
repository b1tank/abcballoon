
#!/bin/bash

set -e

echo "🔧 Loading environment variables..."
source "$(dirname "$0")/0_utils.sh"
load_env
echo "✅ Environment loaded."

# Required env vars
stack_name="${APP_NAME}"
compose_file="${DOCKER_COMPOSE_FILE}"
portainer_url="${PORTAINER_URL}"
api_key="${PORTAINER_API_KEY}"
endpoint_id="${PORTAINER_ENDPOINT_ID}"

if [ -z "$api_key" ]; then
	echo "❌ PORTAINER_API_KEY is not set in the environment."
	exit 1
fi

if [ ! -f "$compose_file" ]; then
	echo "❌ $compose_file not found."
	exit 1
fi

stack_content=$(<"$compose_file")

echo "🔎 Checking if stack '$stack_name' exists on Portainer at $portainer_url ..."
stack_list_response=$(mktemp)
stack_list_status=$(curl -sSL -w "%{http_code}" -o "$stack_list_response" -H "X-API-Key: $api_key" \
	--get --data-urlencode "filters={\"EndpointID\":$endpoint_id}" \
	"$portainer_url/stacks")
stack_info=$(cat "$stack_list_response")
rm -f "$stack_list_response"
if [ "$stack_list_status" -ne 200 ] || [ -z "$stack_info" ]; then
	echo "❌ Failed to fetch stack list from Portainer. HTTP status: $stack_list_status"
	echo "Response: $stack_info"
	exit 1
fi
echo "🗂️  Stack list fetched:"
echo "$stack_info" | jq '.'
stack_info_json=$(echo "$stack_info" | jq '.')

echo "🌐 Searching for stack name: $stack_name"
stack_id=$(echo $stack_info_json | jq -r '.[] | select(.Name == "'$stack_name'") | .Id')
echo "🔍 Stack Id: $stack_id"

if [ -z "$stack_id" ]; then
    echo "0️⃣  Stack does not exist."
    # Prepare stack.env for Portainer Env array
    create_stack_env "$compose_file"
    # Convert stack.env to JSON array for Env
    env_json=$(awk -F= 'NF==2 {gsub(/^[ \t]+|[ \t]+$/, "", $1); gsub(/^[ \t]+|[ \t]+$/, "", $2); printf "{\"name\":\"%s\",\"value\":\"%s\"},", $1, $2}' stack.env | sed 's/,$//')
    if [ -n "$env_json" ]; then
        env_json="[$env_json]"
    else
        env_json="[]"
    fi
    create_payload=$(jq -n --arg name "$stack_name" --arg content "$stack_content" --argjson env "$env_json" '{Name: $name, StackFileContent: $content, Env: $env}')
    echo "📝 Creation request payload:"
    echo "$create_payload" | jq .
    echo "🔄 Creating stack $stack_name ..."
    create_response=$(mktemp)
    create_status=$(curl -sSL -w "%{http_code}" -o "$create_response" -X POST \
            -H "X-API-Key: $api_key" \
            -H "Content-Type: application/json" \
            --data "$create_payload" \
            "$portainer_url/stacks/create/standalone/string?endpointId=$endpoint_id")
    create_body=$(cat "$create_response")
    rm -f "$create_response"
    if [ "$create_status" -ge 200 ] && [ "$create_status" -lt 300 ]; then
        echo "✅ Stack created. HTTP status: $create_status"
        echo "$create_body" | jq .
    else
        echo "❌ Failed to create stack. HTTP status: $create_status"
        echo "$create_body" | jq .
        exit 1
    fi
else
       echo "📝 Stack exists (ID: $stack_id)."
       # Prepare stack.env for Portainer Env array
       create_stack_env "$compose_file"
       env_json=$(awk -F= 'NF==2 {gsub(/^[ \t]+|[ \t]+$/, "", $1); gsub(/^[ \t]+|[ \t]+$/, "", $2); printf "{\"name\":\"%s\",\"value\":\"%s\"},", $1, $2}' stack.env | sed 's/,$//')
       if [ -n "$env_json" ]; then
           env_json="[$env_json]"
       else
           env_json="[]"
       fi
       update_payload=$(jq -n --arg content "$stack_content" --argjson env "$env_json" '{StackFileContent: $content, Env: $env}')
       echo "📝 Update request payload:"
       echo "$update_payload" | jq .
       echo "🔄 Updating stack $stack_name ..."
       update_response=$(mktemp)
       update_status=$(curl -sSL -w "%{http_code}" -o "$update_response" -X PUT \
               -H "X-API-Key: $api_key" \
               -H "Content-Type: application/json" \
               --data "$update_payload" \
               "$portainer_url/stacks/$stack_id?endpointId=$endpoint_id")
       update_body=$(cat "$update_response")
       rm -f "$update_response"
       if [ "$update_status" -ge 200 ] && [ "$update_status" -lt 300 ]; then
           echo "✅ Stack updated. HTTP status: $update_status"
           echo "$update_body" | jq .
       else
           echo "❌ Failed to update stack. HTTP status: $update_status"
           echo "$update_body" | jq .
           exit 1
       fi
fi

echo "🎉 Visit the deployed app at ${APP_URL}"
