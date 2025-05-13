<script>
	import '../app.css';
	import { mdiRefresh } from '@mdi/js';
  import { Drawer, AppBar, ListItem, Button, Toggle, MenuField } from 'svelte-ux';
  // let drawerOpen = false;
</script>

<div class="min-h-screen bg-gray-50">
  <AppBar  menuIcon={null} class="bg-blue-600 text-white">
    <a href="/" class="text-white no-underline hover:underline text-lg font-bold">Besu Ops</a>
  </AppBar>

  <main class="m-2 p-2">
    <slot />
  </main>
</div>

<style>
  main {
    min-height: calc(100vh - 4rem);
  }
</style> 