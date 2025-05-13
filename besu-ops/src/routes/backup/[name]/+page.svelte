<script lang="ts">
  import { Button, TextField, Collapse } from 'svelte-ux';
  import { onMount } from 'svelte';

  export let data: { name: string };
  let memberHost: string = data.name;
  let nodeName: string = data.name;


  let nodes: { name: string; ip: string; ports: number[] }[] = [];
  let error: string | null = null;
  let namespace = 'besu';

  async function loadNodes() {
    if (typeof window !== 'undefined') {
        namespace = localStorage.getItem('besuNamespace') || 'besu';
    }

    error = null;
    try {
      const res = await fetch(`/api/network?namespace=${encodeURIComponent(namespace)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      nodes = data.nodes || [];

      const node = nodes.find(node => node.ip === memberHost);
      if (node) {
        nodeName = node.name;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      nodes = [];
    }
  }

  
  let backingUp= false
  let backups: string[] = [];

  async function loadBackups() {
    const res = await fetch(`/api/backup/${nodeName}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    backups = data;
  }

  onMount(() => {
    loadNodes();
    loadBackups();
  });

  async function onBackup() {
    backingUp = true;
    try {
      const res = await fetch(`/api/backup/${nodeName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('backup result', data);
      loadBackups();
    } catch (e) {
      error = `Error backing up: ${e}`
    } finally {
      backingUp = false;
    }
  }

</script>

<div class="px-4">
  <h1 class="text-4xl font-bold mb-4">{nodeName}</h1>

  {#if error}
  <div class="text-red-500">{error}</div>
  {/if}
  {#if backups.length == 0}
  <p>No node backups found</p>
  {/if}
  {#if backups.length > 0}
    <div>
      <h2 class="text-2xl font-bold mb-4">{backups.length} Backup{backups.length > 1 ? "s" : ""}</h2>
      <ul>
        {#each backups as backup}
          <li>{backup}</li>
        {/each}
      </ul>
    </div>
  {/if}
  <div>
    <Button class="py-4 my-8 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
     on:click={onBackup} disabled={backingUp} >Backup Node</Button>
  </div>
</div>