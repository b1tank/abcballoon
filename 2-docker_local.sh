#!/bin/bash

echo "🔧 Loading environment variables..."
source "$(dirname "$0")/0_utils.sh"
load_env
echo "✅ Environment loaded."

image_name="${APP_NAME}"
tag="${TAG_LOCAL}"

# Trap Ctrl-C (SIGINT) to remove the container
cleanup() {
  echo
  echo "🧹 Cleaning up: removing container $image_name..."
  docker rm -f "$image_name" 2>/dev/null && echo "🗑️  Container removed." || echo "⚠️  No container to remove."
}
trap cleanup INT


echo "🐳 Building Docker image: $image_name:$tag"
docker build . -f "${DOCKERFILE_NAME}" -t "$image_name:$tag"
echo "🎉 Docker image built."


echo
echo "🚀 Running container: $image_name at http://localhost:${APP_PORT_HOST}"
echo
docker run \
  --name "$image_name" \
  -p "${APP_PORT_HOST}:${APP_PORT_CONTAINER}" \
  "$image_name:$tag"