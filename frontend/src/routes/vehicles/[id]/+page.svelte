<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Layout } from '$lib/components/layout';
  import { Card, Button, Input, Modal, Spinner, EmptyState, Badge, Tabs } from '$lib/components/ui';
  import { vehiclesStore, servicesStore, expensesStore, toastStore, kmHistoryStore } from '$lib/stores';
  import { vehicleService, serviceService, expenseService } from '$lib/services';
  import { formatNumber, formatCurrency, formatJalaliDate, formatJalaliDateTime } from '$lib/utils/format';
  import { SERVICE_TYPES, EXPENSE_CATEGORIES, EXPENSE_ICONS } from '$lib/utils/constants';
  import type { Vehicle, ServiceRecord, Expense, KmHistoryRecord } from '$lib/types';

  let isLoading = $state(true);
  let vehicle = $state<Vehicle | null>(null);
  let services = $state<ServiceRecord[]>([]);
  let expenses = $state<Expense[]>([]);
  let kmHistory = $state<KmHistoryRecord[]>([]);

  let activeTab = $state('services');
  let showKmModal = $state(false);
  let showAddKmModal = $state(false);
  let showKmHistoryModal = $state(false);
  let newKm = $state(0);
  let isUpdatingKm = $state(false);
  let isAddingKm = $state(false);

  // Form data for manual KM entry
  let kmFormData = $state({
    km: 0,
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    note: '',
  });

  const tabs = [
    { id: 'services', label: 'سرویس‌ها', icon: '🔧' },
    { id: 'expenses', label: 'هزینه‌ها', icon: '💰' },
    { id: 'kmHistory', label: 'تاریخچه کیلومتر', icon: '📊' },
  ];

  onMount(async () => {
    const id = $page.params.id;
    if (id) {
      await loadVehicleData(id);
    }
  });

  async function loadVehicleData(id: string) {
    isLoading = true;
    try {
      const [vehicleData, servicesData, expensesData, kmHistoryData] = await Promise.all([
        vehicleService.getById(id),
        serviceService.getAll(id),
        expenseService.getAll(id),
        vehicleService.getKmHistory(id),
      ]);
      vehicle = vehicleData;
      services = servicesData;
      expenses = expensesData;
      kmHistory = kmHistoryData;
      newKm = vehicleData.currentKm;
      kmFormData.km = vehicleData.currentKm;
      kmHistoryStore.setHistory(kmHistoryData);
    } catch {
      toastStore.error('خطا در بارگذاری اطلاعات خودرو');
    } finally {
      isLoading = false;
    }
  }

  async function updateKilometers() {
    if (!vehicle) return;

    isUpdatingKm = true;
    try {
      const updated = await vehicleService.updateKm(vehicle.id, newKm);
      vehicle = updated;
      vehiclesStore.updateKilometers(vehicle.id, newKm);
      showKmModal = false;
      toastStore.success('کیلومتر به‌روزرسانی شد');
    } catch {
      toastStore.error('خطا در به‌روزرسانی کیلومتر');
    } finally {
      isUpdatingKm = false;
    }
  }

  async function addKmManual() {
    if (!vehicle) return;

    isAddingKm = true;
    try {
      // استفاده از متد addKmHistory برای ثبت در تاریخچه
      const updated = await vehicleService.addKmHistory(
        vehicle.id,
        kmFormData.km,
        'manual',
        undefined,
        kmFormData.note || undefined
      );
      
      vehicle = updated;
      vehiclesStore.updateKilometers(vehicle.id, kmFormData.km);
      
      // Refresh history
      const historyData = await vehicleService.getKmHistory(vehicle.id);
      kmHistory = historyData;
      kmHistoryStore.setHistory(historyData);
      
      showAddKmModal = false;
      toastStore.success('کیلومتر با موفقیت ثبت شد');
      
      // Reset form
      kmFormData = {
        km: vehicle.currentKm,
        date: new Date().toISOString().slice(0, 16),
        note: '',
      };
    } catch {
      toastStore.error('خطا در ثبت کیلومتر');
    } finally {
      isAddingKm = false;
    }
  }

  function getTotalServiceCost(): number {
    return services.reduce((sum, s) => sum + s.cost, 0);
  }

  function getTotalExpenses(): number {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function getSourceLabel(sourceType: string): string {
    const labels = {
      manual: 'دستی',
      service: 'سرویس',
      expense: 'هزینه',
      initial: 'اولیه',
    };
    return labels[sourceType] || sourceType;
  }

  function getSourceIcon(sourceType: string): string {
    const icons = {
      manual: '📝',
      service: '🔧',
      expense: '💰',
      initial: '🚀',
    };
    return icons[sourceType] || '📄';
  }
</script>

<Layout showBack={true} headerTitle={vehicle?.model || 'جزئیات خودرو'}>
  <div class="page-container">
    {#if isLoading}
      <div class="loading-container">
        <Spinner size="lg" />
        <p>در حال بارگذاری...</p>
      </div>
    {:else if !vehicle}
      <Card>
        <EmptyState
          icon="❌"
          title="خودرو یافت نشد"
          description="این خودرو وجود ندارد یا حذف شده است"
        >
          <Button variant="primary" onclick={() => goto('/vehicles')}>بازگشت به لیست</Button>
        </EmptyState>
      </Card>
    {:else}
      <!-- Vehicle Info Card -->
      <Card variant="solid" padding="lg" class="vehicle-info-card">
        <div class="vehicle-header">
          <div class="vehicle-icon">🚗</div>
          <div class="vehicle-details">
            <h1 class="vehicle-model">{vehicle.model}</h1>
            <div class="vehicle-meta">
              <span>{vehicle.plateNumber}</span>
              <span>•</span>
              <span>سال {formatNumber(vehicle.year)}</span>
            </div>
          </div>
        </div>

        <div class="km-section">
          <div class="km-display">
            <span class="km-value">{formatNumber(vehicle.currentKm)}</span>
            <span class="km-label">کیلومتر فعلی</span>
          </div>
          <div class="km-actions">
            <Button variant="secondary" size="sm" onclick={() => (showAddKmModal = true)}>
              ✏️ ثبت کیلومتر جدید
            </Button>
            <Button variant="ghost" size="sm" onclick={() => (showKmHistoryModal = true)}>
              📊 تاریخچه
            </Button>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box">
            <span class="stat-icon">🔧</span>
            <span class="stat-value">{formatCurrency(getTotalServiceCost(), 'toman')}</span>
            <span class="stat-label">هزینه سرویس</span>
          </div>
          <div class="stat-box">
            <span class="stat-icon">💰</span>
            <span class="stat-value">{formatCurrency(getTotalExpenses(), 'toman')}</span>
            <span class="stat-label">سایر هزینه‌ها</span>
          </div>
        </div>

        {#if vehicle.note}
          <div class="vehicle-note">
            <span class="note-icon">📝</span>
            <span>{vehicle.note}</span>
          </div>
        {/if}
      </Card>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a href="/add?tab=service&vehicle={vehicle.id}" class="quick-btn">
          <span class="quick-icon">🔧</span>
          <span>ثبت سرویس</span>
        </a>
        <a href="/add?tab=expense&vehicle={vehicle.id}" class="quick-btn">
          <span class="quick-icon">💰</span>
          <span>ثبت هزینه</span>
        </a>
      </div>

      <!-- Services, Expenses & KM History Tabs -->
      <Tabs {tabs} bind:activeTab />

      {#if activeTab === 'services'}
        <div class="records-list">
          {#if services.length === 0}
            <Card>
              <EmptyState
                icon="🔧"
                title="سرویسی ثبت نشده"
                description="اولین سرویس این خودرو را ثبت کنید"
              >
                <a href="/add?tab=service&vehicle={vehicle.id}">
                  <Button variant="primary">ثبت سرویس</Button>
                </a>
              </EmptyState>
            </Card>
          {:else}
            {#each services as service}
              <Card padding="md" variant="solid">
                <div class="record-header">
                  <div class="record-type">
                    <span class="type-icon">🔧</span>
                    <div class="type-labels">
                      {#if service.types && service.types.length > 0}
                        {#each service.types as type}
                          <span class="type-label">{SERVICE_TYPES[type] || type}</span>
                        {/each}
                      {:else}
                        <span class="type-label">{SERVICE_TYPES[service.type]}</span>
                      {/if}
                    </div>
                  </div>
                  <Badge variant="primary">{formatJalaliDate(service.date)}</Badge>
                </div>
                <div class="record-details">
                  <div class="detail-item">
                    <span class="detail-label">هزینه</span>
                    <span class="detail-value">{formatCurrency(service.cost, 'toman')}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">کیلومتر</span>
                    <span class="detail-value">{formatNumber(service.km)}</span>
                  </div>
                </div>
                {#if service.note}
                  <p class="record-note">{service.note}</p>
                {/if}
              </Card>
            {/each}
          {/if}
        </div>
      {:else if activeTab === 'expenses'}
        <div class="records-list">
          {#if expenses.length === 0}
            <Card>
              <EmptyState
                icon="💰"
                title="هزینه‌ای ثبت نشده"
                description="هزینه‌های این خودرو را ثبت کنید"
              >
                <a href="/add?tab=expense&vehicle={vehicle.id}">
                  <Button variant="primary">ثبت هزینه</Button>
                </a>
              </EmptyState>
            </Card>
          {:else}
            {#each expenses as expense}
              <Card padding="md" variant="solid">
                <div class="record-header">
                  <div class="record-type">
                    <span class="type-icon">{EXPENSE_ICONS[expense.category]}</span>
                    <span class="type-label">{EXPENSE_CATEGORIES[expense.category]}</span>
                  </div>
                  <Badge variant="default">{formatJalaliDate(expense.date)}</Badge>
                </div>
                <div class="record-details">
                  <div class="detail-item">
                    <span class="detail-label">مبلغ</span>
                    <span class="detail-value">{formatCurrency(expense.amount, 'toman')}</span>
                  </div>
                  {#if expense.km}
                    <div class="detail-item">
                      <span class="detail-label">کیلومتر</span>
                      <span class="detail-value">{formatNumber(expense.km)}</span>
                    </div>
                  {/if}
                </div>
                {#if expense.note}
                  <p class="record-note">{expense.note}</p>
                {/if}
              </Card>
            {/each}
          {/if}
        </div>
      {:else}
        <!-- KM History Tab -->
        <div class="records-list">
          {#if kmHistory.length === 0}
            <Card>
              <EmptyState
                icon="📊"
                title="تاریخچه کیلومتر خالی است"
                description="اولین کیلومتر را ثبت کنید یا سرویس/هزینه اضافه کنید"
              >
                <Button variant="primary" onclick={() => (showAddKmModal = true)}>
                  ثبت کیلومتر جدید
                </Button>
              </EmptyState>
            </Card>
          {:else}
            {#each kmHistory as record}
              <Card padding="md" variant="solid">
                <div class="record-header">
                  <div class="record-type">
                    <span class="type-icon">{getSourceIcon(record.sourceType)}</span>
                    <span class="type-label">{getSourceLabel(record.sourceType)}</span>
                  </div>
                  <Badge variant="default">{formatJalaliDateTime(record.recordedAt)}</Badge>
                </div>
                <div class="record-details">
                  <div class="detail-item">
                    <span class="detail-label">کیلومتر</span>
                    <span class="detail-value">{formatNumber(record.km)}</span>
                  </div>
                  {#if record.sourceId}
                    <div class="detail-item">
                      <span class="detail-label">شناسه</span>
                      <span class="detail-value">{record.sourceId}</span>
                    </div>
                  {/if}
                </div>
                {#if record.note}
                  <p class="record-note">{record.note}</p>
                {/if}
              </Card>
            {/each}
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</Layout>

<!-- Add KM Modal -->
<Modal bind:open={showAddKmModal} title="ثبت کیلومتر جدید" size="sm">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      addKmManual();
    }}
  >
    <Input 
      type="number" 
      name="km" 
      label="کیلومتر" 
      bind:value={kmFormData.km} 
      min={0} 
      required 
      placeholder="مثال: ۸۵۰۰۰"
    />
    <Input 
      type="datetime-local" 
      name="recordedAt" 
      label="تاریخ و زمان ثبت" 
      bind:value={kmFormData.date} 
      required 
    />
    <Input 
      name="note" 
      label="یادداشت (اختیاری)" 
      bind:value={kmFormData.note} 
      placeholder="توضیحات بیشتر..."
    />
    <div class="modal-actions">
      <Button type="button" variant="secondary" onclick={() => (showAddKmModal = false)}>
        انصراف
      </Button>
      <Button type="submit" variant="primary" loading={isAddingKm}>ثبت</Button>
    </div>
  </form>
</Modal>

<!-- KM History Modal -->
<Modal bind:open={showKmHistoryModal} title="تاریخچه کیلومتر" size="lg">
  <div class="km-history-list">
    {#if kmHistory.length === 0}
      <EmptyState
        icon="📊"
        title="تاریخچه خالی است"
        description="هنوز کیلومتری ثبت نشده است"
      />
    {:else}
      {#each kmHistory as record}
        <div class="history-item">
          <div class="history-main">
            <span class="history-icon">{getSourceIcon(record.sourceType)}</span>
            <div class="history-info">
              <div class="history-title">
                <span class="source-label">{getSourceLabel(record.sourceType)}</span>
                <span class="km-value">{formatNumber(record.km)} کیلومتر</span>
              </div>
              <div class="history-meta">
                <span>{formatJalaliDateTime(record.recordedAt)}</span>
                {#if record.sourceId}
                  <span>•</span>
                  <span>شناسه: {record.sourceId}</span>
                {/if}
              </div>
              {#if record.note}
                <div class="history-note">{record.note}</div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <div class="modal-actions">
    <Button type="button" variant="primary" onclick={() => {
      showKmHistoryModal = false;
      showAddKmModal = true;
    }}>
      ✏️ ثبت کیلومتر جدید
    </Button>
  </div>
</Modal>

<style>
  /* Vehicle detail page specific styles */
  /* Using shared page-container from layouts.css */

  /* Vehicle Info Card */
  :global(.vehicle-info-card) {
    margin-bottom: var(--space-lg);
  }

  @media (min-width: 768px) {
    :global(.vehicle-info-card) {
      margin-bottom: var(--space-xl);
    }
  }

  .vehicle-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  @media (min-width: 768px) {
    .vehicle-header {
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }
  }

  .vehicle-icon {
    font-size: 3rem;
  }

  @media (min-width: 768px) {
    .vehicle-icon {
      font-size: 3.5rem;
    }
  }

  .vehicle-details {
    flex: 1;
    min-width: 0;
  }

  .vehicle-model {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
  }

  @media (min-width: 768px) {
    .vehicle-model {
      font-size: var(--font-size-2xl);
    }
  }

  .vehicle-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text-light);
  }

  .km-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(30, 58, 138, 0.05);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .km-display {
    display: flex;
    flex-direction: column;
  }

  .km-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .km-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .km-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  @media (min-width: 768px) {
    .stats-row {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
  }

  .stat-icon {
    font-size: 1.25rem;
  }

  .stat-box .stat-value {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .stat-box .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .vehicle-note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--color-text-light);
  }

  /* Quick Actions */
  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  @media (min-width: 768px) {
    .quick-actions {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }
  }

  .quick-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--glass-bg-solid);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-text);
    font-weight: 500;
    transition: all 0.2s;
  }

  .quick-btn:hover {
    background: white;
    box-shadow: var(--glass-shadow);
  }

  .quick-icon {
    font-size: 1.25rem;
  }

  /* Records List */
  .records-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  @media (min-width: 768px) {
    .records-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-lg);
    }
  }

  @media (min-width: 1024px) {
    .records-list {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-xl);
    }
  }

  .record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .record-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .type-icon {
    font-size: 1.25rem;
  }

  .type-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .type-label {
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    background: var(--color-primary-light);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .record-details {
    display: flex;
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .detail-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .detail-value {
    font-weight: 500;
  }

  .record-note {
    margin: 0.75rem 0 0;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 0.875rem;
    color: var(--color-text-light);
  }

  /* Modal actions - using shared styles from layouts.css */
  .modal-actions {
    display: flex;
    gap: var(--space-md);
    justify-content: flex-end;
    margin-top: var(--space-lg);
  }

  @media (min-width: 480px) {
    .modal-actions {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  @media (min-width: 768px) {
    .modal-actions {
      gap: var(--space-lg);
      margin-top: var(--space-xl);
    }
  }

  /* KM History Styles */
  .km-history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.25rem;
  }

  .history-item {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .history-main {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .history-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .history-info {
    flex: 1;
    min-width: 0;
  }

  .history-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
  }

  .source-label {
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    background: var(--color-primary-light);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .km-value {
    font-weight: 700;
    color: var(--color-primary);
    font-size: 1rem;
  }

  .history-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  .history-note {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 0.875rem;
    color: var(--color-text-light);
  }
</style>
