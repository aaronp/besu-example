<script lang="ts">
  import { TextField } from 'svelte-ux';
  import type { StatefulSetResponse } from '../api/network/+server';
  let nodes: { name: string; ip: string; ports: number[] }[] = [];
  let cluster : StatefulSetResponse[] = [];
  let loading = true;
  let error: string | null = null;
  let namespace = 'besu';

  $: if (typeof window !== 'undefined') {
    localStorage.setItem('besuNamespace', namespace);
  }

  async function loadNodes() {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/network?namespace=${encodeURIComponent(namespace)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      nodes = data.nodes || [];
      cluster = data.cluster || [];
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
    {#each cluster as statefulSet}
      <li>
        {#if statefulSet.statefulSet}
          <div class="bg-white rounded shadow p-4 border border-gray-200 mt-">
            <h2 class="text-2xl font-bold mb-4">{statefulSet.statefulSet}</h2>

            <a href={`/scale/${statefulSet.statefulSet}`} class="text-blue-600 hover:underline">Scale</a>
            {#each statefulSet.services as service}
              {#each service.pods as pod}
                <span class="text-gray-500">(pod {pod})</span>
              {/each}
              <div class="mt-2">
                <a href={`/node/${service.ip}`} class="text-blue-600 hover:underline">Block Explorer</a> | 
                <a href={`/backup/${service.name}`} class="text-blue-600 hover:underline">Backup Node</a>
              </div>
            {/each}
          </div>
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