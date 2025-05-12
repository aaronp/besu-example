<script lang="ts">
import { ethers } from 'ethers';
import { onMount } from 'svelte';

interface Account {
  address: string;
  privateKey: string;
  publicKey: string;
}

let accounts: Account[] = [];
let error: string = '';

// Load accounts from localStorage on mount
onMount(() => {
  const stored = localStorage.getItem('accounts');
  if (stored) {
    try {
      accounts = JSON.parse(stored);
    } catch (e) {
      error = 'Failed to load accounts from storage.';
    }
  }
});

function saveAccounts() {
  localStorage.setItem('accounts', JSON.stringify(accounts));
}

function createAccount() {
  try {
    const wallet = ethers.Wallet.createRandom();
    const account: Account = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey
    };
    accounts = [...accounts, account];
    saveAccounts();
    error = '';
  } catch (e) {
    error = 'Failed to create account.';
  }
}

function deleteAccount(index: number) {
  accounts = accounts.filter((_, i) => i !== index);
  saveAccounts();
}
</script>

<h1>Accounts Page</h1>

<button on:click={createAccount} class="bg-blue-600 text-white px-4 py-2 rounded mb-4">Create New Account</button>

{#if error}
  <p class="text-red-600">{error}</p>
{/if}

{#if accounts.length === 0}
  <p>No accounts found.</p>
{:else}
  <ul class="space-y-4">
    {#each accounts as account, i}
      <li class="border p-4 rounded bg-gray-100">
        <div><strong>Address:</strong> {account.address}</div>
        <div><strong>Public Key:</strong> <code>{account.publicKey}</code></div>
        <div><strong>Private Key:</strong> <code>{account.privateKey}</code></div>
        <button on:click={() => deleteAccount(i)} class="mt-2 bg-red-500 text-white px-2 py-1 rounded">Delete</button>
      </li>
    {/each}
  </ul>
{/if} 