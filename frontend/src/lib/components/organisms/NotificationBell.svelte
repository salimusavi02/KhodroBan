<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { notificationService } from '$lib/services/notificationService';
  import { currentUser } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { writable } from 'svelte/store';
  import type { Notification } from '$lib/types';
  import { fade, slide } from 'svelte/transition';

  let notifications = writable<Notification[]>([]);
  let unreadCount = writable(0);
  let isOpen = $state(false);
  let realtimeChannel: any = null;
  let isLoading = $state(false);
  let isMockMode = $state(false);

  // Mock data for testing
  const mockNotifications: Notification[] = [
    {
      id: 'mock-1',
      user_id: 'mock-user',
      vehicle_id: 1,
      title: 'یادآوری سرویس دوره‌ای',
      body: 'خودرو پژو ۲۰۶ (12345) نیاز به سرویس دوره‌ای دارد. 2 روز تا موعد (90 روز) باقی مانده است.',
      type: 'reminder',
      read: false,
      metadata: {
        vehicle_model: 'پژو ۲۰۶',
        plate_number: '12345',
        days_until_due: 2,
        interval_days: 90,
        last_service_date: '2024-10-01',
        due_date: '2024-12-30'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      user_id: 'mock-user',
      vehicle_id: 2,
      title: '⚠️ هشدار سرویس دوره‌ای',
      body: 'خودرو سمند LX (67890) موعد سرویس دوره‌ای گذشته است! 5 روز تأخیر',
      type: 'warning',
      read: false,
      metadata: {
        vehicle_model: 'سمند LX',
        plate_number: '67890',
        days_until_due: -5,
        interval_days: 90,
        last_service_date: '2024-09-15',
        due_date: '2024-12-15'
      },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Reactive derived values
  let user = $derived($currentUser);
  let userId = $derived(user?.id);

  // Effect for loading notifications when user changes
  $effect(() => {
    if (userId) {
      loadNotifications(userId);
      subscribeToRealtime(userId);
    }
  });

  onMount(async () => {
    if (userId) {
      await loadNotifications(userId);
      subscribeToRealtime(userId);
    }
  });

  onDestroy(() => {
    if (realtimeChannel && supabase) {
      supabase.removeChannel(realtimeChannel);
    }
  });

  async function loadNotifications(userId: string) {
    isLoading = true;
    try {
      // Check if mock mode
      if (!supabase || isMockMode) {
        // Use mock data
        notifications.set(mockNotifications);
        unreadCount.set(mockNotifications.filter(n => !n.read).length);
        isMockMode = true;
        return;
      }

      const data = await notificationService.getNotifications(userId, true);
      notifications.set(data);
    
      const count = await notificationService.getUnreadCount(userId);
      unreadCount.set(count);
      isMockMode = false;
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to mock
      notifications.set(mockNotifications);
      unreadCount.set(mockNotifications.filter(n => !n.read).length);
      isMockMode = true;
    } finally {
      isLoading = false;
    }
  }

  function subscribeToRealtime(userId: string) {
    if (!supabase || isMockMode) {
      console.log('Mock mode: Realtime subscription disabled');
      return;
    }

    if (realtimeChannel && supabase) {
      supabase.removeChannel(realtimeChannel);
    }

    realtimeChannel = notificationService.subscribeToNotifications(
      userId,
      (newNotification) => {
        notifications.update(list => [newNotification, ...list]);
        unreadCount.update(c => c + 1);
        showToast(newNotification.title, newNotification.body);
        
        // Play sound (optional)
        playNotificationSound();
      }
    );
  }

  async function markAsRead(id: string) {
    try {
      if (isMockMode) {
        // Mock: update local state
        notifications.update(list => 
          list.map(n => n.id === id ? { ...n, read: true } : n)
        );
        unreadCount.update(c => Math.max(0, c - 1));
        return;
      }

      await notificationService.markAsRead(id);
      notifications.update(list => list.filter(n => n.id !== id));
      unreadCount.update(c => Math.max(0, c - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async function markAllAsRead() {
    if (!userId) return;
  
    try {
      if (isMockMode) {
        // Mock: update local state
        notifications.set([]);
        unreadCount.set(0);
        return;
      }

      await notificationService.markAllAsRead(userId);
      notifications.set([]);
      unreadCount.set(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      if (isMockMode) {
        // Mock: update local state
        notifications.update(list => list.filter(n => n.id !== id));
        unreadCount.update(c => Math.max(0, c - 1));
        return;
      }

      await notificationService.deleteNotification(id);
      notifications.update(list => list.filter(n => n.id !== id));
      unreadCount.update(c => Math.max(0, c - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  function showToast(title: string, body: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;
    toast.innerHTML = `
      <strong style="display: block; margin-bottom: 4px;">${title}</strong>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">${body}</p>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  function playNotificationSound() {
    // Optional: Play a subtle sound
    // const audio = new Audio('/sounds/notification.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  // Toggle mock mode for testing
  function toggleMockMode() {
    isMockMode = !isMockMode;
    if (isMockMode) {
      notifications.set(mockNotifications);
      unreadCount.set(mockNotifications.filter(n => !n.read).length);
    } else {
      if (userId) {
        loadNotifications(userId);
      }
    }
  }

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get notification icon
  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'reminder':
        return '🔔';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'subscription':
        return '💳';
      default:
        return '📢';
    }
  }

  // Click outside action
  function clickOutside(node: HTMLElement, handler: () => void) {
    const onClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('click', onClick, true);

    return {
      destroy() {
        document.removeEventListener('click', onClick, true);
      }
    };
  }
</script>

<div class="notification-bell" use:clickOutside={closeDropdown}>
  <button 
    on:click={toggleDropdown} 
    class="bell-btn"
    aria-label="نوتیفیکیشن‌ها"
    disabled={isLoading}
  >
    <span class="icon">🔔</span>
    {#if $unreadCount > 0}
      <span class="badge" transition:fade>{$unreadCount}</span>
    {/if}
  </button>

  {#if isOpen}
    <div class="notification-dropdown" transition:slide={{ duration: 300 }}>
      <div class="header">
        <h3>نوتیفیکیشن‌ها</h3>
        <div class="header-actions">
          <!-- Mock Mode Toggle -->
          <button 
            on:click={toggleMockMode} 
            class="mock-toggle-btn {isMockMode ? 'active' : ''}"
            title={isMockMode ? 'حالت تست فعال' : 'حالت تست'}
          >
            {isMockMode ? '✓ تست' : 'تست'}
          </button>
          
          {#if $unreadCount > 0}
            <button on:click={markAllAsRead} class="mark-all-btn">
              همه خوانده شد
            </button>
          {/if}
        </div>
      </div>
    
      <div class="list">
        {#if isLoading}
          <div class="loading">در حال بارگذاری...</div>
        {:else if $notifications.length === 0}
          <div class="empty">
            <p>نوتیفیکیشن جدیدی وجود ندارد</p>
            <small>✅ همه چیز به‌روز است</small>
          </div>
        {:else}
          {#each $notifications as notification (notification.id)}
            <div 
              class="notification-item {notification.type}" 
              transition:slide={{ duration: 200 }}
            >
              <div class="notification-content" on:click={() => markAsRead(notification.id)}>
                <div class="icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div class="text">
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                  <small>{formatDate(notification.created_at)}</small>
                  {#if notification.metadata?.days_until_due}
                    <div class="metadata">
                      📅 {notification.metadata.days_until_due} روز مانده
                    </div>
                  {/if}
                </div>
              </div>
              <button 
                class="delete-btn" 
                on:click={() => deleteNotification(notification.id)}
                aria-label="حذف"
              >
                ✕
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-bell {
    position: relative;
    display: inline-block;
  }

  .bell-btn {
    position: relative;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bell-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .bell-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
  }

  .notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 400px;
    max-height: 500px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    margin-top: 8px;
    overflow: hidden;
  }

  .header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
  }

  .header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .mock-toggle-btn {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border: 1px solid #3b82f6;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .mock-toggle-btn:hover {
    background: rgba(59, 130, 246, 0.2);
  }

  .mock-toggle-btn.active {
    background: #3b82f6;
    color: white;
  }

  .mark-all-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .mark-all-btn:hover {
    background: #059669;
  }

  .list {
    max-height: 400px;
    overflow-y: auto;
  }

  .loading {
    padding: 40px;
    text-align: center;
    color: #6b7280;
  }

  .empty {
    padding: 40px 20px;
    text-align: center;
    color: #6b7280;
  }

  .empty p {
    margin: 0 0 8px 0;
    font-size: 1rem;
  }

  .empty small {
    color: #10b981;
    font-weight: 500;
  }

  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 14px 16px;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
    gap: 12px;
  }

  .notification-item:hover {
    background: #f9fafb;
  }

  .notification-item.reminder {
    border-left: 4px solid #3b82f6;
  }

  .notification-item.warning {
    border-left: 4px solid #f59e0b;
  }

  .notification-item.info {
    border-left: 4px solid #10b981;
  }

  .notification-content {
    flex: 1;
    display: flex;
    gap: 10px;
    cursor: pointer;
  }

  .icon {
    font-size: 1.2rem;
    min-width: 24px;
  }

  .text {
    flex: 1;
  }

  .text strong {
    display: block;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }

  .text p {
    margin: 0 0 6px 0;
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .text small {
    color: #9ca3af;
    font-size: 0.75rem;
  }

  .metadata {
    display: inline-block;
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 4px;
  }

  .delete-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s;
    align-self: flex-start;
  }

  .delete-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  /* Scrollbar styling */
  .list::-webkit-scrollbar {
    width: 6px;
  }

  .list::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .list::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .list::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* Animations */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* Toast styles (global) */
  :global(.toast-notification) {
    animation: slideIn 0.3s ease-out;
  }
</style>
