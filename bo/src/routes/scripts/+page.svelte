<script lang="ts">
  let script = '';
  let output = '';
  let error = '';
  let loading = false;

  async function executeScript() {
    loading = true;
    output = '';
    error = '';
    try {
      const res = await fetch('/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      });
      const data = await res.json();
      output = data.stdout || '';
      error = data.stderr || '';
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }
</script>

<h1>Execute Script</h1>
<textarea bind:value={script} rows={8} style="width:100%;"></textarea>
<br />
<button on:click={executeScript} disabled={loading} style="margin-top:1em;">{loading ? 'Executing...' : 'Execute'}</button>

{#if loading}
  <div style="margin:1em 0;">
    <span class="spinner" style="display:inline-block;width:24px;height:24px;border:3px solid #ccc;border-top:3px solid #333;border-radius:50%;animation:spin 1s linear infinite;"></span>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
{/if}

{#if output}
  <h2>Standard Output</h2>
  <pre>{output}</pre>
{/if}
{#if error}
  <h2>Standard Error</h2>
  <pre style="color:red">{error}</pre>
{/if} 