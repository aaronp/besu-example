#!/bin/bash

# Check if member number is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <member_number>"
    echo "Example: $0 1"
    exit 1
fi

MEMBER_NUM=$1
MEMBER_NAME="member$MEMBER_NUM"

# Create backup directory with timestamp
BACKUP_DIR="backups/$MEMBER_NAME"
BACKUP_FILE="$BACKUP_DIR/$(date +%Y%m%d-%H%M%S).tar.gz"
mkdir -p "$BACKUP_DIR"

# Get the pod name and namespace
PVC_NAME="${MEMBER_NAME}-data-pvc"
NAMESPACE="quorum"

echo "Starting backup process for $MEMBER_NAME..."

# Scale down the node
echo "Scaling down $MEMBER_NAME node..."
kubectl scale statefulset $MEMBER_NAME --replicas=0 -n $NAMESPACE

# Wait for the pod to terminate
echo "Waiting for pod to terminate..."
while kubectl get pods -n $NAMESPACE -l app=$MEMBER_NAME 2>/dev/null | grep -q $MEMBER_NAME; do
    echo "Pod still terminating..."
    sleep 5
done
echo "Pod has terminated."

# Create a temporary pod to access the PVC and create backup
echo "Creating backup..."
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: backup-pod
  namespace: quorum
spec:
  containers:
  - name: backup
    image: busybox
    command: ['sleep', '3600']
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: $PVC_NAME
EOF

# Wait for backup pod to be ready
echo "Waiting for backup pod to be ready..."
kubectl wait --for=condition=ready pod/backup-pod -n $NAMESPACE --timeout=300s

# Create backup using kubectl cp
echo "Creating tar archive..."
kubectl exec backup-pod -n $NAMESPACE -- tar czf - -C /data . > "$BACKUP_FILE"

# Clean up
kubectl delete pod backup-pod -n $NAMESPACE

echo "Backup completed and saved to $BACKUP_FILE"

# Scale the node back up
echo "Scaling $MEMBER_NAME node back up..."
kubectl scale statefulset $MEMBER_NAME --replicas=1 -n $NAMESPACE

# Wait for the pod to be ready
echo "Waiting for pod to be ready..."
while ! kubectl get pods -n $NAMESPACE -l app=$MEMBER_NAME 2>/dev/null | grep -q "2/2.*Running"; do
    echo "Pod still starting..."
    sleep 5
done
echo "Pod is now running."

echo "Backup process completed successfully!" 