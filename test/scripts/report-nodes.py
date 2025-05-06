#!/usr/bin/env python3

from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import sys
from datetime import datetime

def get_node_info(w3, node_name):
    """Get information about a node including its latest block number."""
    try:
        block_number = w3.eth.block_number
        return {
            'name': node_name,
            'latest_block': block_number
        }
    except Exception as e:
        print(f"Error getting info for node {node_name}: {str(e)}", file=sys.stderr)
        return None

def get_block_info(w3, block_number):
    """Get information about a specific block."""
    try:
        block = w3.eth.get_block(block_number, full_transactions=False)
        return {
            'number': block_number,
            'hash': block['hash'].hex(),
            'timestamp': datetime.fromtimestamp(block['timestamp']).isoformat(),
            'transactions': block['transactions']
        }
    except Exception as e:
        print(f"Error getting block {block_number}: {str(e)}", file=sys.stderr)
        return None

def print_report(node_info, indent=0):
    """Print the report with proper indentation."""
    indent_str = '  ' * indent
    
    # Print node info
    print(f"{indent_str}Node: {node_info['name']}")
    
    # Get and print blocks
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    
    for block_num in range(node_info['latest_block'] + 1):
        block_info = get_block_info(w3, block_num)
        if block_info and len(block_info['transactions']) > 0:  # Only print blocks with transactions
            print(f"{indent_str}  Block {block_num}:")
            print(f"{indent_str}    Hash: {block_info['hash']}")
            print(f"{indent_str}    Timestamp: {block_info['timestamp']}")
            print(f"{indent_str}    Transactions:")
            for tx_hash in block_info['transactions']:
                print(f"{indent_str}      {tx_hash.hex()}")

def main():
    # Get the pod name from command line argument if provided
    pod_name = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Connect to the local Besu node
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    
    if not w3.is_connected():
        print("Failed to connect to Besu node", file=sys.stderr)
        if pod_name:
            print(f"Make sure port forwarding is set up for pod: {pod_name}", file=sys.stderr)
        sys.exit(1)
    
    # Get node info
    node_info = get_node_info(w3, pod_name or "localhost")
    if node_info:
        print_report(node_info)

if __name__ == "__main__":
    main() 