<script lang="ts">
  import { Button } from 'svelte-ux';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  let status: string = '';
  let details: string = '';
  let error: string = '';
  let scaling = false;

  // Get the node name from the route param
  let name = '';
  $: name = get(page).params.name;

  let namespace = 'besu';

  async function loadStatus() {
    if (typeof window !== 'undefined') {
      const ns = localStorage.getItem('besuNamespace');
      if (ns) namespace = ns;
    }
    error = '';
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      status = data.status;
      details = data.details;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      status = '';
      details = '';
    }
  }

  async function scale(action: 'up' | 'down') {
    scaling = true;
    error = '';
    try {
      const res = await fetch('/api/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, podName: name, namespace, replicas: action === 'up' ? 1 : 0 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      status = data.status;
      details = data.message;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      scaling = false;
    }
  }

  onMount(loadStatus);
</script>

<div class="px-4 max-w-xl mx-auto">
  <h1 class="text-3xl font-bold mb-4">Scale Node: <span class="text-blue-700">{name}</span></h1>

  {#if error}
    <div class="text-red-500 mb-2">{error}</div>
  {/if}

  <div class="mb-4 p-4 bg-gray-100 rounded">
    <div class="text-lg font-semibold">Status: <span class="font-mono">{status}</span></div>
    <div class="text-gray-600">{details}</div>
  </div>

  <div class="flex gap-4">
    <Button class="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50" on:click={() => scale('up')} disabled={scaling || status === 'up' || status === 'starting'}>Scale Up</Button>
    <Button class="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50" on:click={() => scale('down')} disabled={scaling || status === 'down' || status === 'stopping'}>Scale Down</Button>
    <Button class="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400" on:click={loadStatus} disabled={scaling}>Refresh</Button>
  </div>
</div>
