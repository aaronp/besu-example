#!/bin/bash

# Exit on error
set -e

echo "Creating a new transaction in the Besu network..."

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
BESU_POD=$(kubectl get pods -n quorum -l app=member1 -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
if [ -z "$BESU_POD" ]; then
    echo "No member pods found. Please ensure the network is running."
    exit 1
fi

echo "Found Besu pod: $BESU_POD"

# Initialize PF_PID as empty
PF_PID=""

# Check if port 8545 is already in use
if lsof -i :8545 > /dev/null; then
    echo "Port 8545 is ready."
else
    # Start port forwarding in the background
    echo "Setting up port forwarding to $BESU_POD..."
    kubectl port-forward -n quorum $BESU_POD 8545:8545 &
    PF_PID=$!


    # Wait for port forwarding to be ready
    echo "Waiting for port forwarding to be ready..."
    sleep 2
fi

# Verify port forwarding is working
if ! curl -s http://127.0.0.1:8545 > /dev/null; then
    echo "Failed to connect to port 8545. Port forwarding may not be working."
    if [ ! -z "$PF_PID" ]; then
        kill $PF_PID
    fi
    exit 1
fi

echo "Port forwarding is working!"

# Check if Python and pip are installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed"
    if [ ! -z "$PF_PID" ]; then
        kill $PF_PID
    fi
    exit 1
fi

if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed"
    if [ ! -z "$PF_PID" ]; then
        kill $PF_PID
    fi
    exit 1
fi

# Install requirements if needed
if [ ! -d "venv" ]; then
    echo "Setting up Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run the Python script with the pod name
echo "Running transaction script..."
source venv/bin/activate
python3 scripts/create-transaction.py "$BESU_POD"

# Clean up port forwarding if we started it
if [ ! -z "$PF_PID" ]; then
    echo "Cleaning up port forwarding..."
    kill $PF_PID
fi 