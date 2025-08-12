#!/bin/bash

echo "🔧 Loading environment variables..."
env_file=".env.example"
source "$(dirname "$0")/0_utils.sh"
load_env $env_file
echo "✅ Environment loaded from $env_file."

# Check if already logged in
if ! az account show > /dev/null 2>&1; then
    echo "🔒 Not logged in. Please enter your Azure tenant ID:"
    read -r TENANT_ID
    echo "🔑 Logging into Azure with tenant ID: $TENANT_ID"
    az login --use-device-code --tenant $TENANT_ID
else
    echo "✅ Already logged in to Azure."
fi

if [ -z "$KEY_VAULT_NAME" ] || [ -z "$ENV_FILE_NAME" ]; then
    echo "❌ KEY_VAULT_NAME or ENV_FILE_NAME not set in .env.example."
    exit 1
fi

echo "🧹 Clearing the output file: $ENV_FILE_NAME"
> "$ENV_FILE_NAME"


echo "🔍 Resolving secrets and writing to $ENV_FILE_NAME..."
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^# ]] || [[ -z "$line" ]]; then
        echo "$line" >> "$ENV_FILE_NAME"
        continue
    fi
    var_name=$(echo "$line" | cut -d'=' -f1)
    var_value=$(echo "$line" | cut -d'=' -f2-)
    # If value is wrapped in <>, fetch from Key Vault (use POSIX shell pattern)
    if [ "${var_value#<}" != "$var_value" ] && [ "${var_value%>}" != "$var_value" ]; then
        secret_name="${var_value#<}"
        secret_name="${secret_name%>}"
        echo "🔑 Fetching secret: $secret_name from Key Vault: $KEY_VAULT_NAME..."
        secret_value=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "$secret_name" --query "value" -o tsv 2>/dev/null)
        if [ -z "$secret_value" ]; then
            echo "⚠️  Warning: Secret $secret_name not found in Key Vault $KEY_VAULT_NAME. Leaving as is."
            echo "$var_name=$var_value" >> "$ENV_FILE_NAME"
        else
            echo "✅ Secret $secret_name resolved."
            echo "$var_name=$secret_value" >> "$ENV_FILE_NAME"
        fi
    else
        echo "$line" >> "$ENV_FILE_NAME"
    fi
done < .env.example

echo "🎉 Environment file $ENV_FILE_NAME has been created with secrets resolved."