<script>
	import { Button } from "svelte-ux";

  let to = '';
  let value = '';
  let privateKey = '';
  let submitting = false;
  let result = '';
  let rpcUrl = 'http://localhost:8545';

  // Load lastTransaction from localStorage if available
  if (typeof window !== 'undefined') {
    const last = localStorage.getItem('lastTransaction');
    if (last) {
      try {
        const parsed = JSON.parse(last);
        to = parsed.to || '';
        value = parsed.value || '';
        privateKey = parsed.privateKey || '';
        rpcUrl = parsed.rpcUrl || 'http://localhost:8545';
      } catch {}
    }
  }

  async function submit() {
    submitting = true;
    result = '';
    // Store to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastTransaction', JSON.stringify({ to, value, privateKey, rpcUrl }));
    }
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, value, privateKey, rpcUrl })
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

<h1 class="text-2xl font-bold">Transfer</h1>
<br/>
<form on:submit|preventDefault={submit}>
  <label>
    Besu RPC URL:
    <input bind:value={rpcUrl} required type="text" class="w-full text-lg p-3 border rounded"/>
  </label>
  <br />
  <label>
    To Address:
    <input bind:value={to} required class="w-full text-lg p-3 border rounded"/>
  </label>
  <br />
  <label>
    Value (ETH):
    <input bind:value={value} required type="number" min="0" step="any" class="w-full text-lg p-3 border rounded" />
  </label>
  <br />
  <label>
    Private Key:
    <input bind:value={privateKey} required class="w-full text-lg p-3 border rounded" />
  </label>
  <br />
  <Button class="bg-blue-600 text-white rounded px-6 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50" disabled={submitting} on:click={submit}>Submit</Button>
</form>

{#if result}
  <p>{result}</p>
{/if} 