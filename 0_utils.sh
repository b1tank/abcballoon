#!/bin/bash

# Common environment variable loading utilities

# Load environment variables from a given file (default: .env)
load_env() {
  local env_file="${1:-.env}"
  if [ -f "$env_file" ]; then
    set -o allexport
    # shellcheck disable=SC1090
    source "$env_file"
    set +o allexport
  else
    echo "$env_file file not found! Please run 1-create_env.sh to prepare the .env file."
    exit 1
  fi
}

create_stack_env() {
  local compose_file="${1:-docker-compose.yml}"
  local env_file="${2:-.env}"
  local stack_env_file="${3:-stack.env}"

  # Extract all ${VARNAME} patterns from docker-compose file
  local keys
  keys=$(grep -o '\${[A-Za-z0-9_]*}' "$compose_file" | sed 's/[${}]//g' | sort | uniq)

  # Check env file exists
  if [ ! -f "$env_file" ]; then
    echo "$env_file file not found! Please run 1-create_env.sh to prepare the env file."
    exit 1
  fi

  # Prepare stack env file
  > "$stack_env_file"
  for key in $keys; do
    # Get value from env file
    local value
    value=$(grep -E "^$key=" "$env_file" | head -n1 | cut -d'=' -f2-)
    if [ -n "$value" ]; then
      echo "$key=$value" >> "$stack_env_file"
    else
      echo "Warning: $key not found in $env_file" >&2
    fi
  done
}
