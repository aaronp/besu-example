#!/usr/bin/env python3

from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os
import sys

print("Starting transaction script...")

# Get the pod name from command line argument if provided
pod_name = sys.argv[1] if len(sys.argv) > 1 else None
print(f"Using pod: {pod_name}")

# Connect to the local Besu node
print("Attempting to connect to Besu node at http://127.0.0.1:8545...")
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

# Inject the PoA middleware
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Check if connected
if not w3.is_connected():
    print("Failed to connect to Besu node")
    if pod_name:
        print(f"Make sure port forwarding is set up for pod: {pod_name}")
    exit(1)

print("Successfully connected to Besu node!")

# Get the first account (this should be pre-funded in the genesis block)
print("Fetching accounts...")
accounts = w3.eth.accounts
if not accounts:
    print("No accounts found")
    exit(1)

print(f"Found {len(accounts)} accounts")
sender = accounts[0]
receiver = accounts[1] if len(accounts) > 1 else accounts[0]
print(f"Using sender: {sender}")
print(f"Using receiver: {receiver}")

# Get current gas price and nonce
print("Fetching gas price and nonce...")
gas_price = w3.eth.gas_price
nonce = w3.eth.get_transaction_count(sender)
print(f"Gas price: {gas_price}")
print(f"Nonce: {nonce}")

# Create a simple transaction
transaction = {
    'from': sender,
    'to': receiver,
    'value': w3.to_wei(1, 'ether'),  # Send 1 ETH
    'gas': 21000,
    'gasPrice': gas_price,
    'nonce': nonce,
    'chainId': w3.eth.chain_id
}

print("Transaction details:")
print(json.dumps(transaction, indent=2))

try:
    # Send the transaction
    print("Sending transaction...")
    tx_hash = w3.eth.send_transaction(transaction)
    print(f"Transaction sent! Hash: {tx_hash.hex()}")
    
    # Wait for transaction receipt
    print("Waiting for transaction receipt...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Transaction mined in block {receipt['blockNumber']}")
    print(f"Gas used: {receipt['gasUsed']}")
    
except Exception as e:
    print(f"Error sending transaction: {str(e)}")
    print(f"Error type: {type(e)}")
    import traceback
    traceback.print_exc()
    exit(1) 