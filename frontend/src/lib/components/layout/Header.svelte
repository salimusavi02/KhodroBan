<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, currentUser, activeReminders } from '../../stores';
  import { APP_NAME } from '../../utils/constants';
  import { navigateTo } from '../../utils/navigation';
  import { getBasePath } from '../../utils/config';
  import NotificationBell from '../organisms/NotificationBell.svelte';

  interface Props {
    showBack?: boolean;
    title?: string;
  }

  let { showBack = false, title = '' }: Props = $props();

  const dispatch = createEventDispatcher();

  function toggleSidebar() {
    dispatch('toggleSidebar');
  }

  function goBack() {
    window.history.back();
  }

  async function handleLogoClick(event: Event) {
    event.preventDefault();
    await navigateTo('/');
  }

  async function handleSettingsClick(event: Event) {
    event.preventDefault();
    await navigateTo('/settings');
  }

  let reminderCount = $derived($activeReminders?.length || 0);
</script>

<header class="header">
  <div class="header-start">
    {#if showBack}
      <button class="header-btn" onclick={goBack} aria-label="بازگشت"> → </button>
    {:else}
      <button class="header-btn menu-btn hide-desktop" onclick={toggleSidebar} aria-label="منو">
        ☰
      </button>
    {/if}

    {#if title}
      <h1 class="header-title">{title}</h1>
    {:else}
      <a href={getBasePath() + '/'} onclick={handleLogoClick} class="header-logo">
        <span class="logo-icon">🚗</span>
        <span class="logo-text">{APP_NAME}</span>
      </a>
    {/if}
  </div>

  <div class="header-end">
    <NotificationBell />

    <button onclick={handleSettingsClick} class="header-user hide-mobile" type="button">
      <span class="user-avatar">👤</span>
      <span class="user-name">{$currentUser?.name || 'کاربر'}</span>
    </button>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--glass-border);
    min-height: 60px;
  }

  .header-start,
  .header-end {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text);
    border-radius: 10px;
  }

  .header-user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text);
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .user-avatar {
    font-size: 1.2rem;
  }

  .user-name {
    font-weight: 500;
  }
</style>
