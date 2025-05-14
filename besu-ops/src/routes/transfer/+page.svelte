<script>
	import { Button } from "svelte-ux";
	import Transfer from '../../lib/Transfer.svelte';

  let to = '';
  let value = '1';
  let privateKey = 'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f';
  let rpcUrl = 'http://besu-validator1.besu.svc.cluster.local:8545';

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
</script>
<a href="/" class="text-blue-600 hover:underline">Home</a>
<h1 class="text-2xl font-bold">Transfer</h1>
<br/>
<Transfer {rpcUrl} />
