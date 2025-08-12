#!/bin/bash


echo "🔧 Loading environment variables..."
source "$(dirname "$0")/0_utils.sh"
load_env
echo "✅ Environment loaded."


image_name="${APP_NAME}"
tag="${TAG_LATEST}"
acr_name="${ACR_NAME}"


echo "🐳 Building Docker image: $image_name:$tag (for linux/amd64)"
# NOTE: For Apple Silicon (ARM architecture), use the following command to build for x86_64 architecture (compatible with Synology NAS)
docker buildx build --platform=linux/amd64 -f Dockerfile -t $image_name:$tag --load .
if [ $? -eq 0 ]; then
    echo "🎉 Docker image built and loaded locally."
else
    echo "❌ Docker build failed."
    exit 1
fi


echo "🔐 Logging in to Azure using service principal..."
az login --service-principal --username $AZURE_CLIENT_ID --password $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
if [ $? -ne 0 ]; then
    echo "❌ Azure login failed. Please use 'az login --use-device-code' and retry."
    exit 1
else
    echo "✅ Azure login successful."
fi


# Prove environment variables are set
echo "🔎 AZURE_SUBSCRIPTION_ID: $AZURE_SUBSCRIPTION_ID"
echo "🔎 AZURE_CLIENT_ID: $AZURE_CLIENT_ID"


# NOTE: if login failed in macOS due to the following error:
#     Error saving credentials: error storing credentials - err: exit status 1, out: `User interaction is not allowed.`
# then run the following command: 
#     security unlock-keychain

echo "🔑 Logging in to Azure Container Registry: $acr_name.azurecr.io..."
docker login $acr_name.azurecr.io --username $AZURE_CLIENT_ID --password $AZURE_CLIENT_SECRET
if [ $? -ne 0 ]; then
    echo "❌ Docker login to ACR failed."
    exit 1
else
    echo "✅ Docker login to ACR successful."
fi

echo "🏷️  Tagging image: $image_name:$tag -> $acr_name.azurecr.io/$image_name:$tag"
docker tag $image_name:$tag $acr_name.azurecr.io/$image_name:$tag
if [ $? -eq 0 ]; then
    echo "✅ Image tagged."
else
    echo "❌ Image tagging failed."
    exit 1
fi

echo "📤 Pushing image to ACR: $acr_name.azurecr.io/$image_name:$tag"
docker push $acr_name.azurecr.io/$image_name:$tag
if [ $? -eq 0 ]; then
    echo "🎉 Image pushed to ACR successfully!"
else
    echo "❌ Image push failed."
    exit 1
fi