#!/bin/bash

# Exit on error
set -e

echo "Taking backup of Besu node..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is required but not installed"
    exit 1
fi

# Check if the quorum namespace exists
if ! kubectl get namespace quorum &> /dev/null; then
    echo "Quorum namespace not found. Please deploy the network first."
    exit 1
fi

# Get the first member pod
POD=$(kubectl get pods -n quorum -l "app in (member1,member2,member3)" -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
if [ -z "$POD" ]; then
    echo "No member pods found. Please ensure the network is running."
    exit 1
fi

echo "Found pod: $POD"

# Gracefully shut down the node
echo "Gracefully shutting down the node..."
kubectl exec -n quorum "$POD" -c ${POD%-0}-quorum -- pkill -TERM besu || true

# Wait for the node to shut down by monitoring the pod status
echo "Waiting for node to shut down..."
while true; do
    # Check if the pod is still running
    STATUS=$(kubectl get pod -n quorum "$POD" -o jsonpath='{.status.containerStatuses[?(@.name=="'${POD%-0}'-quorum")].ready}')
    echo "Status: $STATUS"
    if ! echo "$STATUS" | grep -q "true"; then
        echo "Node is down"
        break
    fi
    echo "Waiting for ${POD} to shut down, status is : $STATUS"
    sleep 5
done

# Create backup directory with ISO timestamp
BACKUP_DIR="./backups/$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Get the data directory from the pod
echo "Getting data directory from pod..."
DATA_DIR="/data"
echo "Data directory in pod: $DATA_DIR"

# Create a temporary directory for the backup
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy data from the pod
echo "Copying data from pod..."
kubectl cp -n quorum "$POD:$DATA_DIR/" "$TEMP_DIR/" -c ${POD%-0}-quorum

# Move the data to the backup directory
echo "Moving data to backup directory..."
mv "$TEMP_DIR"/* "$BACKUP_DIR/"

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Create a metadata file with backup information
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Backup Information:
------------------
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Source Pod: $POD
Data Directory: $DATA_DIR
EOF

# Restart the node
echo "Restarting the node..."
kubectl delete pod -n quorum "$POD"

# Wait for the pod to be ready
echo "Waiting for node to restart..."
kubectl wait --for=condition=ready pod/"$POD" -n quorum --timeout=300s

echo "Backup completed successfully to: $BACKUP_DIR"
echo "Backup information:"
cat "$BACKUP_DIR/backup-info.txt" 