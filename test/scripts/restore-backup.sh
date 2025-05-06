#!/bin/bash

# Exit on error
set -e

echo "Restoring Besu node backup..."

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

# Check if backups directory exists
if [ ! -d "./backups" ]; then
    echo "No backups directory found. Please take a backup first."
    exit 1
fi

# Get list of backups and find the most recent one
BACKUPS=($(ls -t ./backups))
if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "No backups found in ./backups directory"
    exit 1
fi

# Display available backups
echo "Available backups:"
for i in "${!BACKUPS[@]}"; do
    echo "[$i] ${BACKUPS[$i]}"
done

# Prompt for backup selection
echo -n "Select backup to restore (default: 0 - ${BACKUPS[0]}): "
read -r selection

# Use default if no selection made
if [ -z "$selection" ]; then
    selection=0
fi

# Validate selection
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -ge ${#BACKUPS[@]} ]; then
    echo "Invalid selection"
    exit 1
fi

BACKUP_DIR="./backups/${BACKUPS[$selection]}"
echo "Selected backup: $BACKUP_DIR"

# Verify backup directory exists and has required files
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

if [ ! -d "$BACKUP_DIR/dd" ] || [ ! -d "$BACKUP_DIR/tm" ]; then
    echo "Backup appears to be invalid (missing dd or tm directories)"
    exit 1
fi

# Get the first member pod
POD=$(kubectl get pods -n quorum -l "app in (member1,member2,member3)" -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
if [ -z "$POD" ]; then
    echo "No member pods found. Please ensure the network is running."
    exit 1
fi

echo "Found pod: $POD"

# Stop the pod to ensure clean restore
echo "Stopping pod $POD..."
kubectl delete pod -n quorum "$POD"

# Wait for pod to be ready
echo "Waiting for pod to be ready..."
kubectl wait --for=condition=ready pod/"$POD" -n quorum --timeout=300s

# Copy backup data to the pod
echo "Copying backup data to pod..."
echo "Current directory: $(pwd)"
echo "Backup directory: $BACKUP_DIR"

# Create tar archives of the data
echo "Creating tar archives..."
TEMP_DIR=$(mktemp -d)
cd "$BACKUP_DIR"
tar cf "$TEMP_DIR/dd.tar" -C "$(pwd)" dd
tar cf "$TEMP_DIR/tm.tar" -C "$(pwd)" tm
cd - > /dev/null

echo "Copying database data..."
kubectl cp "$TEMP_DIR/dd.tar" "quorum/$POD:/data/" -c ${POD%-0}-quorum
kubectl exec -n quorum "$POD" -c ${POD%-0}-quorum -- sh -c 'cd /data && tar xf dd.tar && rm dd.tar'

echo "Copying transaction manager data..."
kubectl cp "$TEMP_DIR/tm.tar" "quorum/$POD:/data/" -c ${POD%-0}-quorum
kubectl exec -n quorum "$POD" -c ${POD%-0}-quorum -- sh -c 'cd /data && tar xf tm.tar && rm tm.tar'

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Restart the pod to apply changes
echo "Restarting pod to apply changes..."
kubectl delete pod -n quorum "$POD"

# Wait for pod to be ready
echo "Waiting for pod to be ready..."
kubectl wait --for=condition=ready pod/"$POD" -n quorum --timeout=300s

echo "Backup restored successfully!"
echo "Restored from: $BACKUP_DIR"
echo "To pod: $POD" 