#!/bin/sh

# Defaults (can be overridden by env)
TAG="${TAG:-0.0.3}"
IMAGE="${IMAGE:-kindservices/besu-ops}"

echo "Pushing $IMAGE:$TAG"
docker push "$IMAGE:$TAG"

# Bump patch version in Makefile
MAKEFILE="$(dirname "$0")/../Makefile"
if grep -qE '^TAG \?= [0-9]+\.[0-9]+\.[0-9]+' "$MAKEFILE"; then
  # Extract current version
  CUR_VER=$(grep -E '^TAG \?= [0-9]+\.[0-9]+\.[0-9]+' "$MAKEFILE" | head -1 | awk '{print $3}')
  MAJOR=$(echo $CUR_VER | cut -d. -f1)
  MINOR=$(echo $CUR_VER | cut -d. -f2)
  PATCH=$(echo $CUR_VER | cut -d. -f3)
  NEXT_PATCH=$((PATCH + 1))
  NEXT_VER="$MAJOR.$MINOR.$NEXT_PATCH"
  sed -i '' "s/^TAG \?= $CUR_VER/TAG ?= $NEXT_VER/" "$MAKEFILE"
  echo "Bumped Makefile $TAG to $NEXT_VER"
fi

# Update deployment.yaml image version
DEPLOYMENT_YAML="$(dirname "$0")/../k8s/deployment.yaml"
sed -i '' "s|image: kindservices/besu-ops:[^\"]*|image: kindservices/besu-ops:$TAG|" "$DEPLOYMENT_YAML"
echo "Updated deployment.yaml image to $TAG" 