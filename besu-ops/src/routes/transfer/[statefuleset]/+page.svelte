<script lang="ts">
import { onMount } from 'svelte';
import Transfer from '$lib/Transfer.svelte';
import { page } from '$app/stores';
import { get } from 'svelte/store';

let rpcUrl: string | undefined = undefined;
let loading = true;
let error: string | null = null;

// Get stateful set name from path
const statefulSetName = get(page).params.statefuleset;

onMount(async () => {
    loading = true;
    error = null;
    try {
        const res = await fetch('/api/network');
        const data = await res.json();
        // Find the stateful set
        const found = data.cluster.find((item: any) => item.statefulSet === statefulSetName);
        if (found && found.services && found.services.length > 0) {
            // Use the first service's ip as rpcUrl
            const service = found.services.find((svc: any) => svc.ip);
            if (service && service.ip) {
                //${service.ports[0] || 
                rpcUrl = `http://${service.ip}:8545`;
            } else {
                error = 'No service with IP found for this stateful set.';
            }
        } else {
            error = 'Stateful set not found.';
        }
    } catch (e) {
        error = 'Failed to load network info.';
    } finally {
        loading = false;
    }
});
</script>
<a href="/" class="text-blue-600 hover:underline">Home</a> | <a href="/network" class="text-blue-600 hover:underline">Cluster</a>
{#if loading}
  <div class="p-4">Loading...</div>
{:else if error}
  <div class="p-4 text-red-600">{error}</div>
{:else if rpcUrl}
  <Transfer {rpcUrl} />
{/if}
