<script lang="ts">
  import { onMount } from 'svelte';
  import { Layout } from '$lib/components/layout';
  import { Card, Button, Badge, EmptyState, Spinner, Input, Select } from '$lib/components/ui';
  import { ReminderModal } from '$lib/components/organisms';
  import { remindersStore, toastStore, activeReminders, vehiclesStore } from '$lib/stores';
  import { reminderService, vehicleService } from '$lib/services';
  import type { Reminder, ReminderCreateData, Vehicle } from '$lib/types';
  import { formatNumber } from '$lib/utils/format';

  let isLoading = $state(true);
  let showCreateModal = $state(false);
  let showEditModal = $state(false);
  let editingReminder = $state<Reminder | null>(null);
  let filter = $state<'all' | 'active' | 'dismissed'>('active');
  
  // Search and filters
  let searchQuery = $state('');
  let selectedVehicleFilter = $state<string>('all');
  let dateRangeFilter = $state<'all' | 'thisWeek' | 'thisMonth' | 'nextMonth'>('all');

  // Reactive: filtered reminders
  let reminders = $derived.by(() => {
    const store = $remindersStore;
    if (!store || !store.reminders) return [];
    let all = store.reminders;
    
    // Apply status filter
    if (filter === 'active') all = all.filter(r => !r.dismissed);
    if (filter === 'dismissed') all = all.filter(r => r.dismissed);
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      all = all.filter(r => 
        r.title?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.vehicleName?.toLowerCase().includes(query) ||
        r.message?.toLowerCase().includes(query)
      );
    }
    
    // Apply vehicle filter
    if (selectedVehicleFilter !== 'all') {
      all = all.filter(r => {
        const vehicleId = r.vehicle_id || r.vehicleId;
        return String(vehicleId) === selectedVehicleFilter;
      });
    }
    
    // Apply date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      all = all.filter(r => {
        if (!r.due_date && !r.dueDate) return false;
        const dueDate = new Date(r.due_date || r.dueDate || '');
        if (isNaN(dueDate.getTime())) return false;
        
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const daysDiff = Math.ceil((dueDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateRangeFilter) {
          case 'thisWeek':
            return daysDiff >= 0 && daysDiff <= 7;
          case 'thisMonth':
            return daysDiff >= 0 && daysDiff <= 30;
          case 'nextMonth':
            return daysDiff >= 31 && daysDiff <= 60;
          default:
            return true;
        }
      });
    }
    
    return all;
  });

  // Reactive: counts
  let activeCount = $derived($remindersStore?.reminders?.filter(r => !r.dismissed).length || 0);
  let totalCount = $derived($remindersStore?.reminders?.length || 0);
  let dismissedCount = $derived($remindersStore?.reminders?.filter(r => r.dismissed).length || 0);

  // Grouped reminders
  let groupedReminders = $derived.by(() => {
    const result = {
      overdue: [] as Reminder[],
      near: [] as Reminder[],
      ok: [] as Reminder[],
      dismissed: [] as Reminder[],
    };

    reminders.forEach((r) => {
      if (r.dismissed) {
        result.dismissed.push(r);
      } else if (r.status === 'overdue') {
        result.overdue.push(r);
      } else if (r.status === 'near') {
        result.near.push(r);
      } else {
        result.ok.push(r);
      }
    });

    return result;
  });

  // Vehicles for filter
  let vehicles = $state<Vehicle[]>([]);

  onMount(async () => {
    await Promise.all([
      loadReminders(),
      loadVehicles()
    ]);
  });

  async function loadVehicles() {
    try {
      vehicles = await vehicleService.getAll();
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  }

  async function loadReminders() {
    isLoading = true;
    try {
      const data = await reminderService.getUserReminders();
      remindersStore.setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      toastStore.error('خطا در بارگذاری یادآورها');
    } finally {
      isLoading = false;
    }
  }

  function handleCreate() {
    showCreateModal = true;
  }

  function handleEdit(reminder: Reminder) {
    editingReminder = reminder;
    showEditModal = true;
  }

  async function handleDelete(id: string) {
    if (!confirm('آیا مطمئن هستید که این یادآور را حذف کنید؟')) return;
    
    try {
      await reminderService.delete(id);
      remindersStore.deleteReminder(id);
      toastStore.success('یادآور حذف شد');
    } catch (error) {
      toastStore.error('خطا در حذف یادآور');
    }
  }

  async function handleDismiss(id: string) {
    try {
      await reminderService.dismiss(id);
      remindersStore.dismissReminder(id);
      toastStore.success('یادآور بسته شد');
    } catch (error) {
      console.error('Dismiss error:', error);
      toastStore.error('خطا در بستن یادآور');
    }
  }

  async function handleSaveCreate(e: CustomEvent<ReminderCreateData>) {
    try {
      const newReminder = await reminderService.create(e.detail);
      remindersStore.addReminder(newReminder);
      toastStore.success('یادآور ایجاد شد');
      showCreateModal = false;
    } catch (error) {
      toastStore.error('خطا در ایجاد یادآور');
    }
  }

  async function handleSaveEdit(e: CustomEvent<ReminderCreateData>) {
    if (!editingReminder) {
      toastStore.error('خطا: یادآور برای ویرایش یافت نشد');
      return;
    }
    
    const reminderId = editingReminder.id;
    
    try {
      const updated = await reminderService.update(reminderId, e.detail);
      remindersStore.updateReminder(reminderId, updated);
      toastStore.success('یادآور ویرایش شد');
      // Close modal - this will trigger handleModalClose
      showEditModal = false;
    } catch (error) {
      console.error('Update error:', error);
      toastStore.error('خطا در ویرایش یادآور');
    }
  }

  function handleModalClose() {
    showCreateModal = false;
    showEditModal = false;
    editingReminder = null;
  }

  function getStatusVariant(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'ok') return 'success';
    if (status === 'near') return 'warning';
    return 'danger';
  }

  function getCategoryIcon(category: 'vehicle_service' | 'general'): string {
    return category === 'vehicle_service' ? '🚗' : '📌';
  }

  function getStatusLabel(status: string): string {
    if (status === 'ok') return 'عادی';
    if (status === 'near') return 'نزدیک';
    return 'گذشته';
  }

  // Get vehicle for reminder
  function getVehicleForReminder(reminder: Reminder): Vehicle | null {
    const vehicleId = reminder.vehicle_id || reminder.vehicleId;
    if (!vehicleId) return null;
    return vehicles.find(v => String(v.id) === String(vehicleId)) || null;
  }

  // Calculate days/km remaining
  function getDaysRemaining(reminder: Reminder): number | null {
    if (!reminder.due_date && !reminder.dueDate) return null;
    const dueDate = new Date(reminder.due_date || reminder.dueDate || '');
    if (isNaN(dueDate.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function getKmRemaining(reminder: Reminder, vehicle: Vehicle | null): number | null {
    if (!reminder.due_km && !reminder.dueKm) return null;
    if (!vehicle || !vehicle.currentKm) return null;
    const dueKm = reminder.due_km || reminder.dueKm || 0;
    return dueKm - vehicle.currentKm;
  }

  // Calculate progress percentage (0-100)
  function getProgress(reminder: Reminder, vehicle: Vehicle | null): number {
    const warningDays = reminder.warning_days_before || reminder.warningDaysBefore || 7;
    
    // Date-based progress
    if (reminder.due_date || reminder.dueDate) {
      const daysRemaining = getDaysRemaining(reminder);
      if (daysRemaining !== null) {
        if (daysRemaining <= 0) return 100; // Overdue
        const totalDays = warningDays * 2; // Assume warning period is half of total
        const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
        return progress;
      }
    }
    
    // KM-based progress
    if (reminder.due_km || reminder.dueKm) {
      const kmRemaining = getKmRemaining(reminder, vehicle);
      if (kmRemaining !== null) {
        if (kmRemaining <= 0) return 100; // Overdue
        const warningKm = (reminder.warning_days_before || reminder.warningDaysBefore || 7) * 100;
        const totalKm = warningKm * 2;
        const progress = Math.max(0, Math.min(100, ((totalKm - kmRemaining) / totalKm) * 100));
        return progress;
      }
    }
    
    return 0;
  }
</script>

<Layout headerTitle="یادآورها">
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <h1>یادآورها</h1>
      <Button variant="primary" onclick={handleCreate}>
        ➕ ایجاد یادآور جدید
      </Button>
    </div>

    <!-- Status Filters -->
    <div class="filters">
      <Button 
        variant={filter === 'active' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => filter = 'active'}
      >
        فعال ({activeCount})
      </Button>
      <Button 
        variant={filter === 'all' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => filter = 'all'}
      >
        همه ({totalCount})
      </Button>
      <Button 
        variant={filter === 'dismissed' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => filter = 'dismissed'}
      >
        بسته شده ({dismissedCount})
      </Button>
    </div>

    <!-- Search and Advanced Filters -->
    <div class="search-filters">
      <div class="search-box">
        <Input
          type="text"
          placeholder="🔍 جستجو در عنوان، توضیحات، خودرو..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
      
      <div class="advanced-filters">
        <Select
          bind:value={selectedVehicleFilter}
          options={[
            { value: 'all', label: 'همه خودروها' },
            ...vehicles.map(v => ({ 
              value: String(v.id), 
              label: `${v.model} - ${v.plateNumber}` 
            }))
          ]}
          class="filter-select"
        />
        
        <Select
          bind:value={dateRangeFilter}
          options={[
            { value: 'all', label: 'همه تاریخ‌ها' },
            { value: 'thisWeek', label: 'این هفته' },
            { value: 'thisMonth', label: 'این ماه' },
            { value: 'nextMonth', label: 'ماه آینده' }
          ]}
          class="filter-select"
        />
        
        {#if searchQuery || selectedVehicleFilter !== 'all' || dateRangeFilter !== 'all'}
          <Button
            variant="secondary"
            size="sm"
            onclick={() => {
              searchQuery = '';
              selectedVehicleFilter = 'all';
              dateRangeFilter = 'all';
            }}
          >
            🗑️ پاک کردن فیلترها
          </Button>
        {/if}
      </div>
    </div>

    <!-- Loading -->
    {#if isLoading}
      <div class="loading">
        <Spinner size="lg" />
        <p>در حال بارگذاری...</p>
      </div>

    <!-- Empty State -->
    {:else if reminders.length === 0}
      <Card>
        <EmptyState
          icon="🔔"
          title="یادآوری وجود ندارد"
          description="اولین یادآور خود را ایجاد کنید"
        >
          <Button variant="primary" onclick={handleCreate}>
            ایجاد یادآور
          </Button>
        </EmptyState>
      </Card>

    <!-- List -->
    {:else}
      <!-- Overdue Section -->
      {#if filter !== 'dismissed' && groupedReminders.overdue.length > 0}
        <div class="section-group overdue-section">
          <div class="section-header">
            <h2>⚠️ یادآورهای گذشته</h2>
            <Badge variant="danger">{groupedReminders.overdue.length}</Badge>
          </div>
          {#each groupedReminders.overdue as reminder}
            {@const vehicle = getVehicleForReminder(reminder)}
            {@const daysRemaining = getDaysRemaining(reminder)}
            {@const kmRemaining = getKmRemaining(reminder, vehicle)}
            {@const progress = getProgress(reminder, vehicle)}
            <Card variant="solid" class="reminder-card overdue" padding="md">
              <div class="reminder-content">
                <div class="reminder-icon">{getCategoryIcon(reminder.category)}</div>
                <div class="reminder-info">
                  <div class="reminder-header">
                    <h3>{reminder.title}</h3>
                    <Badge variant="danger">گذشته</Badge>
                  </div>
                  {#if reminder.description}
                    <p class="reminder-description">{reminder.description}</p>
                  {/if}
                  <p class="reminder-message">{reminder.message}</p>
                  {#if reminder.vehicleName}
                    <p class="reminder-vehicle">🚗 {reminder.vehicleName}</p>
                  {/if}
                  
                  <!-- Progress and Remaining Info -->
                  <div class="reminder-progress-info">
                    {#if daysRemaining !== null}
                      <Badge variant="danger" class="remaining-badge">
                        ⏰ {Math.abs(daysRemaining)} روز {daysRemaining < 0 ? 'گذشته' : 'باقی مانده'}
                      </Badge>
                    {/if}
                    {#if kmRemaining !== null}
                      <Badge variant="danger" class="remaining-badge">
                        📍 {formatNumber(Math.abs(kmRemaining))} کیلومتر {kmRemaining < 0 ? 'گذشته' : 'باقی مانده'}
                      </Badge>
                    {/if}
                  </div>
                  
                  {#if progress > 0}
                    <div class="progress-bar-container">
                      <div class="progress-bar" style="width: {progress}%"></div>
                    </div>
                  {/if}
                  
                  <div class="reminder-meta">
                    {#if reminder.dueDate}<span>📅 {reminder.dueDate}</span>{/if}
                    {#if reminder.dueKm}<span>📍 {formatNumber(reminder.dueKm)} کیلومتر</span>{/if}
                    <span class="source">منبع: {reminder.source === 'manual' ? 'دستی' : 'خودکار'}</span>
                  </div>
                </div>
                <div class="reminder-actions">
                  <Button variant="secondary" size="sm" onclick={() => handleDismiss(reminder.id)}>✅ بستن</Button>
                  <Button variant="primary-outline" size="sm" onclick={() => handleEdit(reminder)}>✏️ ویرایش</Button>
                  <Button variant="danger-outline" size="sm" onclick={() => handleDelete(reminder.id)}>🗑️ حذف</Button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}

      <!-- Near Section -->
      {#if filter !== 'dismissed' && groupedReminders.near.length > 0}
        <div class="section-group near-section">
          <div class="section-header">
            <h2>🔔 یادآورهای نزدیک</h2>
            <Badge variant="warning">{groupedReminders.near.length}</Badge>
          </div>
          {#each groupedReminders.near as reminder}
            {@const vehicle = getVehicleForReminder(reminder)}
            {@const daysRemaining = getDaysRemaining(reminder)}
            {@const kmRemaining = getKmRemaining(reminder, vehicle)}
            {@const progress = getProgress(reminder, vehicle)}
            <Card variant="solid" class="reminder-card near" padding="md">
              <div class="reminder-content">
                <div class="reminder-icon">{getCategoryIcon(reminder.category)}</div>
                <div class="reminder-info">
                  <div class="reminder-header">
                    <h3>{reminder.title}</h3>
                    <Badge variant="warning">نزدیک</Badge>
                  </div>
                  {#if reminder.description}
                    <p class="reminder-description">{reminder.description}</p>
                  {/if}
                  <p class="reminder-message">{reminder.message}</p>
                  {#if reminder.vehicleName}
                    <p class="reminder-vehicle">🚗 {reminder.vehicleName}</p>
                  {/if}
                  
                  <!-- Progress and Remaining Info -->
                  <div class="reminder-progress-info">
                    {#if daysRemaining !== null}
                      <Badge variant="warning" class="remaining-badge">
                        ⏰ {daysRemaining} روز باقی مانده
                      </Badge>
                    {/if}
                    {#if kmRemaining !== null}
                      <Badge variant="warning" class="remaining-badge">
                        📍 {formatNumber(kmRemaining)} کیلومتر باقی مانده
                      </Badge>
                    {/if}
                  </div>
                  
                  {#if progress > 0}
                    <div class="progress-bar-container">
                      <div class="progress-bar warning" style="width: {progress}%"></div>
                    </div>
                  {/if}
                  
                  <div class="reminder-meta">
                    {#if reminder.dueDate}<span>📅 {reminder.dueDate}</span>{/if}
                    {#if reminder.dueKm}<span>📍 {formatNumber(reminder.dueKm)} کیلومتر</span>{/if}
                    <span class="source">منبع: {reminder.source === 'manual' ? 'دستی' : 'خودکار'}</span>
                  </div>
                </div>
                <div class="reminder-actions">
                  <Button variant="secondary" size="sm" onclick={() => handleDismiss(reminder.id)}>✅ بستن</Button>
                  <Button variant="primary-outline" size="sm" onclick={() => handleEdit(reminder)}>✏️ ویرایش</Button>
                  <Button variant="danger-outline" size="sm" onclick={() => handleDelete(reminder.id)}>🗑️ حذف</Button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}

      <!-- OK Section -->
      {#if filter !== 'dismissed' && groupedReminders.ok.length > 0}
        <div class="section-group ok-section">
          <div class="section-header">
            <h2>✅ یادآورهای عادی</h2>
            <Badge variant="success">{groupedReminders.ok.length}</Badge>
          </div>
          {#each groupedReminders.ok as reminder}
            {@const vehicle = getVehicleForReminder(reminder)}
            {@const daysRemaining = getDaysRemaining(reminder)}
            {@const kmRemaining = getKmRemaining(reminder, vehicle)}
            {@const progress = getProgress(reminder, vehicle)}
            <Card variant="solid" class="reminder-card ok" padding="md">
              <div class="reminder-content">
                <div class="reminder-icon">{getCategoryIcon(reminder.category)}</div>
                <div class="reminder-info">
                  <div class="reminder-header">
                    <h3>{reminder.title}</h3>
                    <Badge variant="success">عادی</Badge>
                  </div>
                  {#if reminder.description}
                    <p class="reminder-description">{reminder.description}</p>
                  {/if}
                  <p class="reminder-message">{reminder.message}</p>
                  {#if reminder.vehicleName}
                    <p class="reminder-vehicle">🚗 {reminder.vehicleName}</p>
                  {/if}
                  
                  <!-- Progress and Remaining Info -->
                  <div class="reminder-progress-info">
                    {#if daysRemaining !== null && daysRemaining > 0}
                      <Badge variant="success" class="remaining-badge">
                        ⏰ {daysRemaining} روز باقی مانده
                      </Badge>
                    {/if}
                    {#if kmRemaining !== null && kmRemaining > 0}
                      <Badge variant="success" class="remaining-badge">
                        📍 {formatNumber(kmRemaining)} کیلومتر باقی مانده
                      </Badge>
                    {/if}
                  </div>
                  
                  {#if progress > 0 && progress < 100}
                    <div class="progress-bar-container">
                      <div class="progress-bar success" style="width: {progress}%"></div>
                    </div>
                  {/if}
                  
                  <div class="reminder-meta">
                    {#if reminder.dueDate}<span>📅 {reminder.dueDate}</span>{/if}
                    {#if reminder.dueKm}<span>📍 {formatNumber(reminder.dueKm)} کیلومتر</span>{/if}
                    <span class="source">منبع: {reminder.source === 'manual' ? 'دستی' : 'خودکار'}</span>
                  </div>
                </div>
                <div class="reminder-actions">
                  <Button variant="secondary" size="sm" onclick={() => handleDismiss(reminder.id)}>✅ بستن</Button>
                  <Button variant="primary-outline" size="sm" onclick={() => handleEdit(reminder)}>✏️ ویرایش</Button>
                  <Button variant="danger-outline" size="sm" onclick={() => handleDelete(reminder.id)}>🗑️ حذف</Button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}

      <!-- Dismissed Section -->
      {#if filter === 'dismissed' && groupedReminders.dismissed.length > 0}
        <div class="section-group dismissed-section">
          <div class="section-header">
            <h2>✅ یادآورهای بسته شده</h2>
            <Badge variant="secondary">{groupedReminders.dismissed.length}</Badge>
          </div>
          {#each groupedReminders.dismissed as reminder}
            <Card variant="solid" class="reminder-card dismissed" padding="md">
              <div class="reminder-content">
                <div class="reminder-icon">{getCategoryIcon(reminder.category)}</div>
                <div class="reminder-info">
                  <div class="reminder-header">
                    <h3>{reminder.title}</h3>
                    <Badge variant="secondary">بسته شده</Badge>
                  </div>
                  {#if reminder.description}
                    <p class="reminder-description">{reminder.description}</p>
                  {/if}
                  <p class="reminder-message">{reminder.message}</p>
                  {#if reminder.vehicleName}
                    <p class="reminder-vehicle">🚗 {reminder.vehicleName}</p>
                  {/if}
                  <div class="reminder-meta">
                    {#if reminder.dueDate}<span>📅 {reminder.dueDate}</span>{/if}
                    {#if reminder.dueKm}<span>📍 {formatNumber(reminder.dueKm)} کیلومتر</span>{/if}
                    <span class="source">منبع: {reminder.source === 'manual' ? 'دستی' : 'خودکار'}</span>
                  </div>
                </div>
                <div class="reminder-actions">
                  <Button variant="primary-outline" size="sm" onclick={() => handleEdit(reminder)}>✏️ ویرایش</Button>
                  <Button variant="danger-outline" size="sm" onclick={() => handleDelete(reminder.id)}>🗑️ حذف</Button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}

      <!-- No reminders in this filter -->
      {#if reminders.length === 0}
        <Card>
          <EmptyState
            icon="🔔"
            title="یادآوری در این دسته‌بندی وجود ندارد"
            description="فیلتر را تغییر دهید یا یادآور جدید ایجاد کنید"
          >
            <Button variant="primary" onclick={handleCreate}>
              ایجاد یادآور
            </Button>
          </EmptyState>
        </Card>
      {/if}
    {/if}
  </div>
</Layout>

<!-- Create Modal -->
<ReminderModal 
  bind:open={showCreateModal}
  mode="general"
  on:save={handleSaveCreate}
  on:close={handleModalClose}
/>

<!-- Edit Modal -->
{#if showEditModal && editingReminder}
  {#key editingReminder.id}
    <ReminderModal 
      bind:open={showEditModal}
      mode="general"
      isEdit={true}
      defaultData={{
        title: editingReminder.title,
        description: editingReminder.description,
        vehicleId: editingReminder.vehicle_id ?? editingReminder.vehicleId,
        dueDate: editingReminder.due_date ?? editingReminder.dueDate,
        dueKm: editingReminder.due_km ?? editingReminder.dueKm,
        warningDaysBefore: editingReminder.warning_days_before ?? editingReminder.warningDaysBefore,
      }}
      on:save={handleSaveEdit}
      on:close={handleModalClose}
    />
  {/key}
{/if}

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
  }

  .page-header h1 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    margin: 0;
  }

  .filters {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    flex-wrap: wrap;
  }

  .search-filters {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    background: var(--color-bg-light);
    border-radius: var(--border-radius-md);
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .advanced-filters {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-select {
    min-width: 200px;
    flex: 1;
  }

  @media (max-width: 768px) {
    .advanced-filters {
      flex-direction: column;
    }
    
    .filter-select {
      width: 100%;
      min-width: unset;
    }
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: var(--space-md);
  }

  .reminders-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .section-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
  }

  .section-header h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 700;
  }

  .overdue-section .section-header h2 {
    color: var(--color-danger);
  }

  .near-section .section-header h2 {
    color: var(--color-warning);
  }

  .ok-section .section-header h2 {
    color: var(--color-success);
  }

  .dismissed-section .section-header h2 {
    color: var(--color-text-muted);
  }

  .reminder-card {
    border-right: 4px solid var(--color-primary);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .reminder-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .reminder-card.near {
    border-right-color: var(--color-warning);
    background: linear-gradient(to left, rgba(245, 158, 11, 0.05), transparent);
  }

  .reminder-card.overdue {
    border-right-color: var(--color-danger);
    background: linear-gradient(to left, rgba(239, 68, 68, 0.05), transparent);
  }

  .reminder-card.ok {
    border-right-color: var(--color-success);
    background: linear-gradient(to left, rgba(16, 185, 129, 0.05), transparent);
  }

  .reminder-card.dismissed {
    border-right-color: var(--color-text-muted);
    opacity: 0.7;
  }

  .reminder-content {
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .reminder-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .reminder-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
  }

  .reminder-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .reminder-description {
    margin: 0;
    color: var(--color-text);
    font-size: var(--font-size-sm);
    font-style: italic;
  }

  .reminder-message {
    margin: 0;
    color: var(--color-text-light);
    font-size: var(--font-size-sm);
  }

  .reminder-vehicle {
    margin: 0;
    color: var(--color-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  .reminder-meta {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .source {
    margin-left: auto;
    opacity: 0.7;
  }

  .reminder-actions {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .reminder-progress-info {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin: var(--space-sm) 0;
  }

  .remaining-badge {
    font-size: var(--font-size-xs);
    padding: var(--space-xs) var(--space-sm);
  }

  .progress-bar-container {
    width: 100%;
    height: 6px;
    background-color: var(--color-bg-light);
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    margin: var(--space-sm) 0;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: var(--border-radius-sm);
    transition: width 0.3s ease;
  }

  .progress-bar.warning {
    background-color: var(--color-warning);
  }

  .progress-bar.success {
    background-color: var(--color-success);
  }

  .progress-bar.danger {
    background-color: var(--color-danger);
  }

  @media (min-width: 768px) {
    .reminder-content {
      flex-direction: row;
      align-items: center;
    }
    
    .reminder-actions {
      flex-direction: column;
      gap: var(--space-sm);
    }
  }
</style>

