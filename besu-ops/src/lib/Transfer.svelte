<script lang="ts">

  import { Button } from "svelte-ux";

  let { rpcUrl } = $props();

  let value =  $state('1')
  let privateKey = $state('ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f')
  let submitting = $state(false)
  let result = $state('')
  let to = $state('')
  let localRpcUrl = $state(rpcUrl || 'http://localhost:8545')
  

  // Load lastTransaction from localStorage if available
  if (typeof window !== 'undefined') {
    const last = localStorage.getItem('lastTransaction');
    if (last) {
      try {
        const parsed = JSON.parse(last);
        to = parsed.to || '';
        value = parsed.value || '';
        privateKey = parsed.privateKey || '';
        // localRpcUrl = parsed.rpcUrl || rpcUrl || 'http://localhost:8545';
      } catch {}
    }
  }

  async function submit() {
    submitting = true;
    result = '';
    // Store to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastTransaction', JSON.stringify({ to: to, value: value, privateKey: privateKey, rpcUrl: localRpcUrl }));
    }
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to, value: value, privateKey: privateKey, rpcUrl: localRpcUrl })
      });
      const data = await res.json();
      result = data.message || JSON.stringify(data);
    } catch (e) {
      result = 'Error: ' + (e && typeof e === 'object' && 'message' in e ? e.message : String(e));
    } finally {
      submitting = false;
    }
  }
</script>

<form on:submit|preventDefault={submit} class="space-y-4">
  <label class="block">
    <span class="block font-semibold mb-1">Besu RPC URL:</span>
    <input bind:value={localRpcUrl} required type="text" class="w-full text-lg p-3 border rounded"/>
  </label>
  <label class="block">
    <span class="block font-semibold mb-1">To Address:</span>
    <input bind:value={to} required class="w-full text-lg p-3 border rounded"/>
  </label>
  <label class="block">
    <span class="block font-semibold mb-1">Value (ETH):</span>
    <input bind:value={value} required type="number" min="0" step="any" class="w-full text-lg p-3 border rounded" />
  </label>
  <label class="block">
    <span class="block font-semibold mb-1">Private Key:</span>
    <input bind:value={privateKey} required class="w-full text-lg p-3 border rounded" />
  </label>
  <Button class="bg-blue-600 text-white rounded px-6 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50" disabled={submitting} on:click={submit}>Submit</Button>
</form>

{#if result}
  <p>{result}</p>
{/if} 