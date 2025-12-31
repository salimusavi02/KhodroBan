<script lang="ts">
  type GroupItem = {
    value: string;
    label: string;
  };

  type Group = {
    id: string;
    label: string;
    icon: string;
    items: GroupItem[];
  };

  interface Props {
    groups: Group[];
    label?: string;
    placeholder?: string;
    value?: string;
    values?: string[];
    error?: string;
    required?: boolean;
    multiple?: boolean;
  }

  let {
    groups,
    label = 'انتخاب کنید',
    placeholder = 'انتخاب کنید...',
    value = $bindable(''),
    values = $bindable([]),
    error = '',
    required = false,
    multiple = false,
  }: Props = $props();

  let searchQuery = $state('');
  let isExpanded = $state(false);
  let openGroups = $state<Set<string>>(new Set());

  // Filter groups based on search
  const filteredGroups = $derived(
    groups
      .map((group) => ({
        ...group,
        items: searchQuery
          ? group.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : group.items,
      }))
      .filter((group) => group.items.length > 0)
  );

  // Get selected items info
  const selectedItems = $derived(
    multiple
      ? groups
          .flatMap((g) => g.items)
          .filter((item) => values.includes(item.value))
      : groups
          .flatMap((g) => g.items)
          .filter((item) => item.value === value)
  );

  const selectedItem = $derived(
    multiple ? null : groups.flatMap((g) => g.items).find((item) => item.value === value)
  );

  const displayText = $derived(() => {
    if (multiple) {
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) return selectedItems[0].label;
      return `${selectedItems.length} مورد انتخاب شده`;
    }
    return selectedItem ? selectedItem.label : placeholder;
  });

  // Open groups when searching
  $effect(() => {
    if (searchQuery) {
      openGroups = new Set(filteredGroups.map(g => g.id));
    }
  });

  function selectItem(itemValue: string) {
    if (multiple) {
      const newValues = [...values];
      const index = newValues.indexOf(itemValue);
      if (index > -1) {
        newValues.splice(index, 1);
      } else {
        newValues.push(itemValue);
      }
      values = newValues;
      // Set primary value to first selected for backward compatibility
      if (newValues.length > 0) {
        value = newValues[0];
      } else {
        value = '';
      }
    } else {
      value = itemValue;
      isExpanded = false;
      searchQuery = '';
      openGroups.clear();
    }
  }

  function toggleGroup(groupId: string) {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    openGroups = newOpenGroups;
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
    if (isExpanded && filteredGroups.length > 0 && openGroups.size === 0) {
      openGroups = new Set([filteredGroups[0].id]);
    }
  }

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    if (searchQuery && !isExpanded) {
      isExpanded = true;
    }
  }

  // Close on Escape key
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isExpanded) {
      isExpanded = false;
      searchQuery = '';
      openGroups.clear();
    }
  }

  $effect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  });
</script>

<div class="grouped-select-accordion-radio">
  {#if label}
    <label class="label" for="grouped-select-display">
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <!-- Selected Value Display -->
  <div
    id="grouped-select-display"
    class="display"
    class:error={!!error}
    class:expanded={isExpanded}
    onclick={toggleExpand}
    role="button"
    aria-label={displayText()}
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && toggleExpand()}
  >
    <div class="display-content">
      <span class={selectedItems.length > 0 || selectedItem ? 'text' : 'placeholder'}>
        {displayText()}
      </span>
      {#if multiple && selectedItems.length > 0}
        <span class="selected-count-badge">{selectedItems.length}</span>
      {/if}
    </div>
    <span class="arrow" class:rotated={isExpanded}>▼</span>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Modal Overlay -->
  {#if isExpanded}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label={label}>
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title" id="grouped-select-title">{label}</h3>
          <button class="close-btn" onclick={() => { isExpanded = false; searchQuery = ''; openGroups.clear(); }} type="button" aria-label="بستن">
            ✕
          </button>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <input
            type="text"
            placeholder="جستجوی سرویس (مثلاً تعویض روغن)..."
            value={searchQuery}
            oninput={handleSearchInput}
            class="search-input"
            aria-label="جستجو"
          />
        </div>

        <!-- Accordion Groups -->
        <div class="accordion-container">
          {#if searchQuery && filteredGroups.flatMap(g => g.items).length === 0}
            <div class="no-results">
              <p>موردی یافت نشد</p>
            </div>
          {:else}
            {#each filteredGroups as group (group.id)}
              <details class="group-details" open={openGroups.has(group.id)}>
                <summary class="group-summary" onclick={(e) => { e.preventDefault(); toggleGroup(group.id); }}>
                  <div class="summary-content">
                    <div class="group-icon">{group.icon}</div>
                    <div class="group-info">
                      <h3 class="group-title">{group.label}</h3>
                      <p class="group-subtitle">{group.items.length} سرویس موجود</p>
                    </div>
                  </div>
                  <span class="expand-icon" class:rotated={openGroups.has(group.id)}>▼</span>
                </summary>
                <div class="group-items">
                  <div class="items-container">
                    {#each group.items as item (item.value)}
                      {@const isSelected = multiple ? values.includes(item.value) : value === item.value}
                      <label class="item-radio" class:selected={isSelected}>
                        <input
                          type={multiple ? 'checkbox' : 'radio'}
                          name={multiple ? `grouped-select-checkbox-${group.id}` : 'grouped-select-radio'}
                          value={item.value}
                          checked={isSelected}
                          onchange={() => selectItem(item.value)}
                          class="radio-input"
                        />
                        <div class="radio-content">
                          <div class="item-info">
                            <span class="item-title">{item.label}</span>
                            <span class="item-description">شامل اجرت تعویض و بازرسی</span>
                          </div>
                          {#if isSelected}
                            <span class="selected-badge">انتخاب شده</span>
                          {/if}
                        </div>
                      </label>
                    {/each}
                  </div>
                </div>
              </details>
            {/each}
          {/if}
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div class="footer-info">
            <span class="footer-label">انتخاب شما:</span>
            <span class="footer-value">
              {#if multiple}
                {selectedItems.length === 0 
                  ? 'موردی انتخاب نشده' 
                  : selectedItems.length === 1 
                    ? selectedItems[0].label 
                    : `${selectedItems.length} مورد انتخاب شده`}
              {:else}
                {selectedItem?.label || 'موردی انتخاب نشده'}
              {/if}
            </span>
          </div>
          <div class="footer-actions">
            <button class="btn-back" onclick={() => { isExpanded = false; searchQuery = ''; openGroups.clear(); }} type="button">
              بازگشت
            </button>
            <button 
              class="btn-confirm" 
              onclick={() => { isExpanded = false; searchQuery = ''; openGroups.clear(); }} 
              type="button" 
              disabled={multiple ? selectedItems.length === 0 : !selectedItem}
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .grouped-select-accordion-radio {
    position: relative;
    width: 100%;
  }

  .label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .required {
    color: var(--color-danger);
    margin-right: 0.25rem;
  }

  .display {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 60px;
  }

  .display:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .display.error {
    border-color: var(--color-danger);
    background: rgba(239, 68, 68, 0.05);
  }

  .display-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    overflow: hidden;
  }

  .selected-count-badge {
    background: var(--color-primary);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .text {
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.05rem;
  }

  .placeholder {
    color: var(--color-text-light);
    font-weight: 500;
  }

  .arrow {
    font-size: 1rem;
    color: var(--color-text-light);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .arrow.rotated {
    transform: rotate(180deg);
  }

  .error-message {
    color: var(--color-danger);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(120, 120, 120, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(4px);
  }

  /* Modal Content */
  .modal-content {
    background: var(--color-bg-primary);
    border-radius: 1rem;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  /* Modal Header */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-light);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--color-danger);
    color: white;
    transform: rotate(90deg);
  }

  /* Search Box */
  .search-box {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    position: sticky;
    top: 60px;
    z-index: 10;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
    background: var(--color-bg-primary);
  }

  /* Accordion Container */
  .accordion-container {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  /* Group Details */
  .group-details {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    transition: all 0.2s ease;
  }

  .group-details:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .group-details[open] {
    background: var(--color-bg-secondary);
  }

  .group-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    cursor: pointer;
    list-style: none;
    background: transparent;
    transition: all 0.2s ease;
    user-select: none;
  }

  .group-summary::-webkit-details-marker {
    display: none;
  }

  .group-summary:hover {
    background: var(--color-bg-secondary);
  }

  .summary-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .group-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    font-size: 1.5rem;
    background: var(--color-bg-secondary);
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .group-summary:hover .group-icon {
    transform: scale(1.05);
  }

  .group-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: right;
    flex: 1;
  }

  .group-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    transition: color 0.2s ease;
  }

  .group-summary:hover .group-title {
    color: var(--color-primary);
  }

  .group-subtitle {
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin: 0;
  }

  .expand-icon {
    font-size: 1.25rem;
    color: var(--color-text-light);
    transition: transform 0.3s ease, color 0.2s ease;
    flex-shrink: 0;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .group-summary:hover .expand-icon {
    color: var(--color-primary);
  }

  /* Group Items */
  .group-items {
    padding: 0.5rem 1rem 1rem;
    background: var(--color-bg-secondary);
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-right: 2px solid var(--color-border);
    padding-right: 1rem;
    margin-right: 1.5rem;
  }

  .item-radio {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid transparent;
    background: var(--color-bg-primary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .item-radio:hover {
    border-color: var(--color-border);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .item-radio.selected {
    border-color: var(--color-primary);
    border-width: 2px;
    background: rgba(30, 59, 138, 0.1);
    box-shadow: 0 2px 8px rgba(30, 59, 138, 0.15);
  }

  .radio-input {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: var(--color-primary);
    flex-shrink: 0;
  }

  .radio-input[type="checkbox"] {
    border-radius: 0.25rem;
  }

  .radio-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: 1rem;
  }

  .item-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    text-align: right;
  }

  .item-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text-primary);
    transition: color 0.2s ease;
  }

  .item-radio:hover .item-title {
    color: var(--color-primary);
  }

  .item-radio.selected .item-title {
    color: var(--color-primary);
  }

  .item-description {
    font-size: 0.75rem;
    color: var(--color-text-light);
  }

  .selected-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-primary);
    background: rgba(30, 59, 138, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    flex-shrink: 0;
  }

  .no-results {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--color-text-light);
    text-align: center;
    font-size: 1.1rem;
    min-height: 200px;
  }

  /* Modal Footer */
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .footer-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .footer-label {
    font-weight: 500;
    color: var(--color-text-light);
  }

  .footer-value {
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .footer-actions {
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  .btn-back,
  .btn-confirm {
    flex: 1;
    padding: 0.625rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-back {
    border: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
  }

  .btn-back:hover {
    background: var(--color-bg-secondary);
  }

  .btn-confirm {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(30, 59, 138, 0.2);
  }

  .btn-confirm:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
  }

  .btn-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Scrollbar */
  .accordion-container::-webkit-scrollbar {
    width: 8px;
  }

  .accordion-container::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
    border-radius: 4px;
  }

  .accordion-container::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  .accordion-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0.5rem;
    }

    .modal-content {
      max-width: 95vw;
      max-height: 95vh;
    }

    .modal-header {
      padding: 0.75rem;
    }

    .modal-title {
      font-size: 1.1rem;
    }

    .search-box {
      padding: 0.75rem;
    }

    .group-summary {
      padding: 0.75rem;
    }

    .group-icon {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.25rem;
    }

    .group-title {
      font-size: 0.875rem;
    }

    .group-subtitle {
      font-size: 0.7rem;
    }

    .group-items {
      padding: 0.5rem 0.75rem 0.75rem;
    }

    .items-container {
      margin-right: 1rem;
      padding-right: 0.75rem;
    }

    .item-radio {
      padding: 0.625rem;
    }

    .footer-actions {
      flex-direction: column;
    }
  }
</style>

