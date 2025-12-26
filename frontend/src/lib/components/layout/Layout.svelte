<script lang="ts">
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import BottomNav from './BottomNav.svelte';
  import { sidebarStore } from '../../stores';

  interface Props {
    showHeader?: boolean;
    showSidebar?: boolean;
    showBottomNav?: boolean;
    headerTitle?: string;
    showBack?: boolean;
  }

  let {
    showHeader = true,
    showSidebar = true,
    showBottomNav = true,
    headerTitle = '',
    showBack = false,
  }: Props = $props();

  let sidebarOpen = $state(false);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<div class="layout" class:has-sidebar={showSidebar}>
  {#if showSidebar}
    <Sidebar bind:open={sidebarOpen} on:close={() => (sidebarOpen = false)} />
  {/if}

  <div class="layout-main">
    {#if showHeader}
      <Header title={headerTitle} {showBack} on:toggleSidebar={toggleSidebar} />
    {/if}

    <main class="layout-content">
      <slot />
    </main>

    {#if showBottomNav}
      <BottomNav />
    {/if}
  </div>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent flex item from overflowing */
  }

  .layout-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Desktop layout with sidebar always visible */
  @media (min-width: 1024px) {
    .layout.has-sidebar {
      display: grid;
      grid-template-columns: 280px 1fr;
    }
  }
</style>
