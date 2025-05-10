#!/bin/bash

set -e

APP_NAME="ops-app"
IMAGE_NAME="kindservices/$APP_NAME"
DEPLOYMENT_FILE="k8s/deployment.yaml" 
TAG="0.0.2"

echo "🔨 Building Docker image: $IMAGE_NAME"
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$TAG .

echo "📦 Loading image into KIND cluster"
kind load docker-image $IMAGE_NAME:latest --name local-cluster

echo "🚀 Applying Kubernetes manifests"
kubectl create namespace ops || echo 'ops namespace exists'
kubectl apply -f $DEPLOYMENT_FILE

echo "🔁 Restarting deployment to pick up new image"
kubectl rollout restart deployment $APP_NAME

echo "✅ Deployment complete. Use 'kubectl get pods' to verify."
