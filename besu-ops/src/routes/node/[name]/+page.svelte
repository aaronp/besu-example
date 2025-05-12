<script lang="ts">
  import { Button, TextField } from 'svelte-ux';

  export let data: { name: string };
  let memberHost: string = data.name;
  let result: string = '';
  let loading = false;
  let batchSize: number = 3000;
  let offset: number = 0;
  let until: number = 0;
  let parsedResult: any = null;

  function getSavedBlockResults() {
    if (typeof window !== 'undefined') {
      const blockResultsRaw = localStorage.getItem('blockResults');
      if (blockResultsRaw) {
        try {
          const blockResults = JSON.parse(blockResultsRaw);
          console.log('loaded blockResults', blockResults);
          const entry = blockResults[memberHost];
          console.log('loaded blockResults is returning', entry);
          return entry;
        } catch (e) {
          console.error('Error parsing block results', e);
          return undefined;
        }
      }
    }
    return undefined;
  }
  async function refresh() {
    // Check localStorage for blockResults if offset==0 and until==0
    let savedBlockResults = getSavedBlockResults();

    // if they're doing a full refresh, use the saved block results if available
    if (offset === 0 && until === 0) {
      if (savedBlockResults && savedBlockResults.highestBlock) {
            until = savedBlockResults.highestBlock;
      }
    }

    loading = true;
    result = '';
    try {
      const res = await fetch(`/api/chain?host=${encodeURIComponent(memberHost)}&batchSize=${batchSize}&offset=${offset}&until=${until}`);
      const data = await res.json();

      if (savedBlockResults?.blocks) {
        console.log(`concatenating ${savedBlockResults.blocks.length} block results w/ ${data.blocks.length} new block results`);
        data.blocks = [...savedBlockResults.blocks, ...data.blocks];
        // remove duplicates
        data.blocks = data.blocks.filter((block: any, index: number, self: any) =>
          index === self.findIndex((t: any) => t.number === block.number)
        );
        data.blocks = data.blocks.sort((a: any, b: any) => a.number - b.number);
      } else {
        console.log('no saved block results', savedBlockResults);
      }

      result = JSON.stringify(data, null, 2);
      parsedResult = data;
      // Save to localStorage if offset==0 and results are present
      if (offset === 0 && data?.blocks?.length > 0 && typeof window !== 'undefined') {
        let blockResults: any = {};
        try {
          blockResults = JSON.parse(localStorage.getItem('blockResults') || '{}');
        } catch {}
        const highestBlock = data.fromBlock;
        until = highestBlock;
        
        blockResults[memberHost] = {
          highestBlock,
          blocks: data.blocks
        };
        localStorage.setItem('blockResults', JSON.stringify(blockResults));
      }
    } catch (e) {
      result = 'Error: ' + (e && typeof e === 'object' && 'message' in e ? e.message : String(e));
      parsedResult = null;
    } finally {
      loading = false;
    }
  }

  async function clearCache() {
    if (typeof window !== 'undefined') {
      let blockResults: any = {};
      try {
        blockResults = JSON.parse(localStorage.getItem('blockResults') || '{}');
      } catch {}
      if (blockResults[memberHost]) {
        delete blockResults[memberHost];
        localStorage.setItem('blockResults', JSON.stringify(blockResults));
      }
    }
    // Optionally clear result/parsedResult if desired
    result = '';
    parsedResult = null;
    until = 0;
  }
</script>

<h1>Node: {data.name}</h1>
<label>
  Member Host:
  <input bind:value={memberHost} />
</label>
<div style="display: flex; gap: 1em; margin: 1em 0;">
  <TextField label="Batch Size" type="integer" bind:value={batchSize} min={1} />
  <TextField label="Offset" type="integer" bind:value={offset} min={0} />
  <TextField label="Until" type="integer" bind:value={until} min={0} />
</div>
<Button class="bg-blue-600 text-white rounded px-6 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"  on:click={refresh} disabled={loading} style="margin-left:1em;">{loading ? 'Refreshing...' : 'Refresh'}</Button>
<Button class="bg-gray-400 text-white rounded px-6 py-3 font-semibold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50" on:click={clearCache} disabled={loading} style="margin-left:0.5em;">Clear Cache</Button>




{#if result && parsedResult?.blocks}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mt-6">
    {#each parsedResult.blocks as block}
      <div class="bg-white rounded shadow p-4 border border-gray-200">
        <div class="font-bold text-lg mb-2">Block #{block.number}</div>
        <div class="text-gray-600 mb-2">Timestamp: {new Date(block.transactions[0]?.timestamp * 1000).toISOString()}</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-1 pr-4">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {#each block.transactions as tx}
                <tr>
                  <td class="py-1 pr-4 font-mono">{tx.hash}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/each}
  </div>
{:else if result}
  <pre>{result}</pre>
{/if}
