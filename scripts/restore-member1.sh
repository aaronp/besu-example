#!/bin/bash

# Check if member number is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <member_number>"
    echo "Example: $0 1"
    exit 1
fi

MEMBER_NUM=$1
MEMBER_NAME="member$MEMBER_NUM"

# Configuration
PVC_NAME="${MEMBER_NAME}-data-pvc"
NAMESPACE="quorum"
BACKUP_DIR="backups/$MEMBER_NAME"  # Use pod-specific directory

# Function to get latest backup
get_latest_backup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "No backups directory found at $BACKUP_DIR!" >&2
        exit 1
    fi

    # Get the most recent backup for this member
    latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -n1)
    
    if [ -z "$latest_backup" ]; then
        echo "No backups found in $BACKUP_DIR for $MEMBER_NAME!" >&2
        exit 1
    fi

    backup_name=$(basename "$latest_backup")
    echo "Latest backup found: $backup_name" >&2
    printf "%s" "$latest_backup"
}

# Get latest backup
latest_backup=$(get_latest_backup)

if [ ! -f "$latest_backup" ]; then
    echo "Error: Backup file not found at $latest_backup"
    exit 1
fi

echo "Starting restore process using backup: $(basename "$latest_backup")"

# Scale down the node
echo "Scaling down $MEMBER_NAME node..."
if ! kubectl scale statefulset $MEMBER_NAME --replicas=0 -n $NAMESPACE; then
    echo "Error: Failed to scale down $MEMBER_NAME node"
    exit 1
fi

# Wait for the pod to terminate
echo "Waiting for pod to terminate..."
while kubectl get pods -n $NAMESPACE -l app=$MEMBER_NAME 2>/dev/null | grep -q $MEMBER_NAME; do
    echo "Pod still terminating..."
    sleep 5
done
echo "Pod has terminated."

# Create a temporary pod to restore the backup
echo "Creating restore pod..."
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: restore-pod
  namespace: quorum
spec:
  containers:
  - name: restore
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

# Wait for restore pod to be ready
echo "Waiting for restore pod to be ready..."
if ! kubectl wait --for=condition=ready pod/restore-pod -n $NAMESPACE --timeout=300s; then
    echo "Error: Restore pod failed to start"
    kubectl logs restore-pod -n $NAMESPACE
    kubectl delete pod restore-pod -n $NAMESPACE
    echo "Scaling $MEMBER_NAME node back up..."
    kubectl scale statefulset $MEMBER_NAME --replicas=1 -n $NAMESPACE
    exit 1
fi

# Clean the data directory
echo "Cleaning data directory..."
if ! kubectl exec restore-pod -n $NAMESPACE -- sh -c 'cd /data && find . -mindepth 1 -delete'; then
    echo "Error: Failed to clean data directory"
    kubectl delete pod restore-pod -n $NAMESPACE
    echo "Scaling $MEMBER_NAME node back up..."
    kubectl scale statefulset $MEMBER_NAME --replicas=1 -n $NAMESPACE
    exit 1
fi

# Restore backup
echo "Restoring backup..."
if ! cat "$latest_backup" | kubectl exec -i restore-pod -n $NAMESPACE -- sh -c 'cd /data && tar xzf - --strip-components=1'; then
    echo "Error: Failed to restore backup"
    kubectl logs restore-pod -n $NAMESPACE
    kubectl delete pod restore-pod -n $NAMESPACE
    echo "Scaling $MEMBER_NAME node back up..."
    kubectl scale statefulset $MEMBER_NAME --replicas=1 -n $NAMESPACE
    exit 1
fi

# Clean up
kubectl delete pod restore-pod -n $NAMESPACE

echo "Backup restored successfully."

# Scale the node back up
echo "Scaling $MEMBER_NAME node back up..."
if ! kubectl scale statefulset $MEMBER_NAME --replicas=1 -n $NAMESPACE; then
    echo "Error: Failed to scale up $MEMBER_NAME node"
    exit 1
fi

# Wait for the pod to be ready
echo "Waiting for pod to be ready..."
while ! kubectl get pods -n $NAMESPACE -l app=$MEMBER_NAME 2>/dev/null | grep -q "2/2.*Running"; do
    echo "Pod still starting..."
    sleep 5
done
echo "Pod is now running."

echo "Restore process completed successfully!" 