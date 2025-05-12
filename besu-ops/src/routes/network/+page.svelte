<script lang="ts">
  import { TextField } from 'svelte-ux';
  let nodes: { name: string; ip: string; ports: number[] }[] = [];
  let loading = true;
  let error: string | null = null;
  let namespace = 'besu';

  async function loadNodes() {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/network?namespace=${encodeURIComponent(namespace)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      nodes = data.nodes || [];
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      nodes = [];
    } finally {
      loading = false;
    }
  }

  loadNodes();
</script>

<h1 class="text-2xl font-bold mb-4">Besu Network Nodes</h1>

<div class="mb-4">
  <TextField
    label="Namespace"
    placeholder="Please enter the kubenernetes namespace"
    bind:value={namespace}
    class="w-full text-xl"
    
    on:change={loadNodes}
  />
</div>

{#if loading}
  <div>Loading <span class="spinner" style="display:inline-block;width:1em;height:1em;border:2px solid #ccc;border-top:2px solid #333;border-radius:50%;animation:spin 1s linear infinite;"></span></div>
{:else if error}
  <div style="color:red">Error: {error}</div>
{:else}
  <ul>
    {#each nodes as node}
      <li>
        {#if node.name && node.name.toLowerCase().includes('validator')}
          <a href={`/node/${node.ip}`} class="text-blue-600 hover:underline">{node.name}</a>
        {:else}
          {node.name}
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 