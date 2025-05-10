#!/bin/bash

set -e

APP_NAME="ops-app"
IMAGE_NAME="kindservices/$APP_NAME"
DEPLOYMENT_FILE="k8s/deployment.yaml" 
TAG=${TAG:-"0.0.1"}

echo "🔨 Building Docker image: $IMAGE_NAME in ${PWD}"
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$TAG .
docker push $IMAGE_NAME:$TAG
docker push $IMAGE_NAME:latest
