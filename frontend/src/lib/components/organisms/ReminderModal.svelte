<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import { Modal, Button, Input, Select, Textarea } from '$lib/components/ui';
  import { reminderService } from '$lib/services';
  import { remindersStore } from '$lib/stores';
  import { toastStore } from '$lib/stores';
  import type { ReminderCreateData, Vehicle, ServiceType } from '$lib/types';
  import { vehicleService } from '$lib/services';

  // Props
  interface Props {
    open?: boolean;
    mode?: 'general' | 'vehicle' | 'service';
    vehicleId?: string;
    serviceType?: ServiceType;
    defaultData?: Partial<ReminderCreateData>;
    isEdit?: boolean; // New: to detect edit mode
  }

  let {
    open = $bindable(false),
    mode = 'general',
    vehicleId = '',
    serviceType = 'oil_change',
    defaultData = {},
    isEdit = false
  }: Props = $props();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Form state
  let title = $state(defaultData.title || '');
  let description = $state(defaultData.description || '');
  let selectedVehicleId = $state(defaultData.vehicleId || vehicleId || '');
  let dueDate = $state(defaultData.dueDate || '');
  let dueKm = $state(defaultData.dueKm ? String(defaultData.dueKm) : '');
  let warningDaysBefore = $state(defaultData.warningDaysBefore || 7);
  let isLoading = $state(false);

  // Vehicles list
  let vehicles = $state<Vehicle[]>([]);

  // Populate form when modal opens
  $effect(() => {
    if (open) {
      title = defaultData.title || '';
      description = defaultData.description || '';
      
      // Convert vehicleId to string
      selectedVehicleId = defaultData.vehicleId 
        ? String(defaultData.vehicleId) 
        : (vehicleId || '');
      
      // Convert dueDate to YYYY-MM-DD format for input type="date"
      if (defaultData.dueDate) {
        const date = new Date(defaultData.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          dueDate = '';
        }
      } else {
        dueDate = '';
      }
      
      // Convert dueKm to string
      dueKm = defaultData.dueKm ? String(defaultData.dueKm) : '';
      warningDaysBefore = defaultData.warningDaysBefore || 7;
    }
  });

  onMount(async () => {
    // Only load vehicles if needed
    if (mode === 'general') {
      await loadVehicles();
    }
  });

  async function loadVehicles() {
    try {
      vehicles = await vehicleService.getAll();
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  }

  function resetForm() {
    title = '';
    description = '';
    selectedVehicleId = vehicleId || '';
    dueDate = '';
    dueKm = '';
    warningDaysBefore = 7;
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toastStore.error('عنوان یادآور را وارد کنید');
      return;
    }

    // Validate:至少 یکی از dueDate یا dueKm باید باشد (اگر vehicle انتخاب شده)
    if (selectedVehicleId && !dueDate && !dueKm) {
      toastStore.error('برای یادآور خودرویی، تاریخ یا کیلومتر سررسید را وارد کنید');
      return;
    }

    isLoading = true;

    const data: ReminderCreateData = {
      title: title.trim(),
      description: description.trim() || undefined,
      vehicleId: selectedVehicleId || undefined,
      dueDate: dueDate || undefined,
      dueKm: dueKm ? parseInt(dueKm) : undefined,
      warningDaysBefore: warningDaysBefore || 7,
    };

    // In service mode or edit mode, dispatch instead of creating
    if (mode === 'service' || isEdit) {
      dispatch('save', data);
      return;
    }

    // Create new reminder
    try {
      const newReminder = await reminderService.create(data);
      remindersStore.addReminder(newReminder);
      
      toastStore.success('یادآور با موفقیت ایجاد شد');
      handleClose();
    } catch (error) {
      console.error('Failed to create reminder:', error);
      toastStore.error('خطا در ایجاد یادآور');
    } finally {
      isLoading = false;
    }
  }

  // Reactive: Pre-fill title based on mode
  $effect(() => {
    if (mode === 'vehicle' && vehicleId && serviceType) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        title = `سرویس بعدی ${serviceType === 'oil_change' ? 'تعویض روغن' : serviceType === 'filter' ? 'فیلتر' : 'سرویس'} ${vehicle.model}`;
      }
    }
  });
</script>

<Modal 
  bind:open={open} 
  title={mode === 'general' ? 'ایجاد یادآور جدید' : 'ایجاد یادآور برای خودرو'}
  size="md"
  on:close={handleClose}
>
  <form onsubmit={handleSubmit} class="reminder-form">
    <!-- عنوان -->
    <div class="form-group">
      <label for="title">عنوان <span class="required">*</span></label>
      <Input 
        id="title"
        bind:value={title}
        placeholder="مثلاً: پرداخت قسط خودرو"
        required
      />
    </div>

    <!-- توضیحات -->
    <div class="form-group">
      <label for="description">توضیحات</label>
      <Textarea
        id="description"
        bind:value={description}
        placeholder="توضیحات بیشتر (اختیاری)"
        rows={3}
      />
    </div>

    <!-- انتخاب خودرو (اختیاری) -->
    {#if mode === 'general'}
      <div class="form-group">
        <label for="vehicle">خودرو (اختیاری)</label>
        <Select 
          id="vehicle"
          bind:value={selectedVehicleId}
          options={[
            { value: '', label: 'بدون خودرو' },
            ...vehicles.map(v => ({ value: String(v.id), label: `${v.model} - ${v.plateNumber}` }))
          ]}
        />
      </div>
    {/if}

    <!-- تاریخ سررسید -->
    <div class="form-group">
      <label for="dueDate">تاریخ سررسید</label>
      <Input 
        id="dueDate"
        type="date"
        bind:value={dueDate}
        placeholder="YYYY-MM-DD"
      />
    </div>

    <!-- کیلومتر سررسید -->
    <div class="form-group">
      <label for="dueKm">کیلومتر سررسید</label>
      <Input 
        id="dueKm"
        type="number"
        bind:value={dueKm}
        placeholder="مثلاً: 90000"
        min="0"
      />
    </div>

    <!-- فاصله هشدار -->
    <div class="form-group">
      <label for="warningDays">هشدار چند روز قبل؟</label>
      <Input 
        id="warningDays"
        type="number"
        bind:value={warningDaysBefore}
        min="1"
        max="30"
      />
    </div>

    <!-- راهنما -->
    <div class="form-hint">
      <small>💡 نکته: می‌توانید هر دو (تاریخ و کیلومتر) را وارد کنید یا فقط یکی را</small>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" onclick={handleClose} disabled={isLoading}>
      انصراف
    </Button>
    <Button 
      variant="primary" 
      onclick={handleSubmit}
      disabled={isLoading || !title.trim()}
      {isLoading}
    >
      {isEdit ? 'ذخیره تغییرات' : (mode === 'service' ? 'ذخیره یادآور' : 'ایجاد یادآور')}
    </Button>
  </svelte:fragment>
</Modal>

<style>
  .reminder-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .required {
    color: var(--color-danger);
  }

  .form-hint {
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    color: var(--color-primary);
    font-size: 0.875rem;
    text-align: center;
  }
</style>

