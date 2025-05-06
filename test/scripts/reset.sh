#!/bin/bash

echo "Cleaning up kubectl port-forward processes..."

# Find all kubectl port-forward processes
PF_PIDS=$(ps aux | grep "kubectl port-forward" | grep -v grep | awk '{print $2}')

if [ -z "$PF_PIDS" ]; then
    echo "No port-forward processes found"
    exit 0
fi

echo "Found port-forward processes: $PF_PIDS"

# Kill each process
for pid in $PF_PIDS; do
    echo "Killing process $pid"
    kill $pid
done

echo "Port-forward cleanup complete" 