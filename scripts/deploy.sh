#!/bin/bash

# Workforce Impact Dashboard Deployment Script
set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
NAMESPACE="workforce-dashboard-${ENVIRONMENT}"

echo "🚀 Starting deployment to ${ENVIRONMENT} environment..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we're connected to the right cluster
CURRENT_CONTEXT=$(kubectl config current-context)
echo "📋 Current kubectl context: ${CURRENT_CONTEXT}"

# Create namespace if it doesn't exist
echo "📦 Creating namespace ${NAMESPACE}..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap and Secrets
echo "⚙️  Applying configuration..."
kubectl apply -f k8s/configmap.yml -n ${NAMESPACE}

# Update deployment with new image tag
echo "🔄 Updating deployment with image tag: ${IMAGE_TAG}..."
sed "s|:latest|:${IMAGE_TAG}|g" k8s/deployment.yml | kubectl apply -f - -n ${NAMESPACE}

# Wait for rollout to complete
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/workforce-dashboard -n ${NAMESPACE} --timeout=300s

# Verify deployment
echo "✅ Verifying deployment..."
kubectl get pods -n ${NAMESPACE} -l app=workforce-dashboard

# Get service information
echo "🌐 Service information:"
kubectl get service workforce-dashboard-service -n ${NAMESPACE}

# Get ingress information (if exists)
if kubectl get ingress workforce-dashboard-ingress -n ${NAMESPACE} &> /dev/null; then
    echo "🔗 Ingress information:"
    kubectl get ingress workforce-dashboard-ingress -n ${NAMESPACE}
fi

# Run health check
echo "🏥 Running health check..."
SERVICE_IP=$(kubectl get service workforce-dashboard-service -n ${NAMESPACE} -o jsonpath='{.spec.clusterIP}')
if kubectl run health-check --image=curlimages/curl --rm -i --restart=Never -- curl -f http://${SERVICE_IP}/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment to ${ENVIRONMENT} completed successfully!"

# Show logs for troubleshooting
echo "📋 Recent logs:"
kubectl logs -l app=workforce-dashboard -n ${NAMESPACE} --tail=20