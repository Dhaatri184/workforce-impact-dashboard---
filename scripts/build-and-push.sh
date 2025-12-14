#!/bin/bash

# Build and Push Docker Image Script
set -e

# Configuration
REGISTRY=${REGISTRY:-"ghcr.io"}
REPOSITORY=${REPOSITORY:-"your-org/workforce-impact-dashboard"}
TAG=${1:-$(git rev-parse --short HEAD)}
PLATFORM=${PLATFORM:-"linux/amd64,linux/arm64"}

echo "🏗️  Building and pushing Docker image..."
echo "Registry: ${REGISTRY}"
echo "Repository: ${REPOSITORY}"
echo "Tag: ${TAG}"
echo "Platform: ${PLATFORM}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Error: Docker buildx is not available"
    exit 1
fi

# Create builder if it doesn't exist
BUILDER_NAME="workforce-dashboard-builder"
if ! docker buildx inspect ${BUILDER_NAME} > /dev/null 2>&1; then
    echo "🔧 Creating buildx builder..."
    docker buildx create --name ${BUILDER_NAME} --use
fi

# Use the builder
docker buildx use ${BUILDER_NAME}

# Build and push multi-platform image
echo "🚀 Building multi-platform image..."
docker buildx build \
    --platform ${PLATFORM} \
    --tag ${REGISTRY}/${REPOSITORY}:${TAG} \
    --tag ${REGISTRY}/${REPOSITORY}:latest \
    --push \
    .

echo "✅ Successfully built and pushed:"
echo "  ${REGISTRY}/${REPOSITORY}:${TAG}"
echo "  ${REGISTRY}/${REPOSITORY}:latest"

# Verify the image
echo "🔍 Verifying image..."
docker buildx imagetools inspect ${REGISTRY}/${REPOSITORY}:${TAG}

echo "🎉 Build and push completed successfully!"