#!/bin/bash

set -e

APP_NAME="besu-ops"
IMAGE_NAME="kindservices/$APP_NAME"
DEPLOYMENT_FILE="k8s/deployment.yaml" 
TAG="0.0.2"

echo "🔨 Building Docker image: $IMAGE_NAME in $PWD"
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$TAG .