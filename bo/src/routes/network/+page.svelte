<script lang="ts">
  let nodes: { name: string; ip: string; ports: number[] }[] = [];
  let loading = true;
  let error: string | null = null;

  async function loadNodes() {
    loading = true;
    error = null;
    try {
      const res = await fetch('/api/network');
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

<h1>Besu Network Nodes</h1>
{#if loading}
  <div>Loading <span class="spinner" style="display:inline-block;width:1em;height:1em;border:2px solid #ccc;border-top:2px solid #333;border-radius:50%;animation:spin 1s linear infinite;"></span></div>
{:else if error}
  <div style="color:red">Error: {error}</div>
{:else}
  <ul>
    {#each nodes as node}
      <li><a href={`/node/${node.name}`}>{node.name}</a> — {node.ip} — Ports: {node.ports.join(', ')}</li>
    {/each}
  </ul>
{/if}

<style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 