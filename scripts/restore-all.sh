#!/bin/bash

# Configuration
NAMESPACE="quorum"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get list of member nodes
echo "Getting list of member nodes..."
members=($(kubectl get statefulset -n $NAMESPACE -l app -o jsonpath='{.items[*].metadata.name}' | grep -o 'member[0-9]*'))

if [ ${#members[@]} -eq 0 ]; then
    echo "No member nodes found in namespace $NAMESPACE!"
    exit 1
fi

echo "Found ${#members[@]} member nodes: ${members[*]}"

# Confirm restore
read -p "Are you sure you want to restore ALL member nodes? This will stop all nodes during the restore process. (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Restore each member node
for member in "${members[@]}"; do
    member_num=${member#member}
    echo "Restoring $member..."
    "$SCRIPT_DIR/restore-member1.sh" "$member_num"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to restore $member"
        exit 1
    fi
done

echo "All member nodes have been restored successfully!" 