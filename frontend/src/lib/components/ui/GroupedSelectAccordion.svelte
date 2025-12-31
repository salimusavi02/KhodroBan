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
    error?: string;
    required?: boolean;
  }

  let {
    groups,
    label = 'انتخاب کنید',
    placeholder = 'انتخاب کنید...',
    value = $bindable(''),
    error = '',
    required = false,
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

  // Get selected item info
  const selectedItem = $derived(
    groups
      .flatMap((g) => g.items)
      .find((item) => item.value === value)
  );

  // Open groups when searching
  $effect(() => {
    if (searchQuery) {
      openGroups = new Set(filteredGroups.map(g => g.id));
    }
  });

  function selectItem(itemValue: string) {
    value = itemValue;
    isExpanded = false;
    searchQuery = '';
    openGroups.clear();
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

<div class="grouped-select-accordion">
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
    aria-label={selectedItem ? selectedItem.label : placeholder}
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && toggleExpand()}
  >
    <div class="display-content">
      {#if selectedItem}
        <span class="text">{selectedItem.label}</span>
      {:else}
        <span class="placeholder">{placeholder}</span>
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
            placeholder="جستجوی سرویس (مثلاً: تعویض روغن، لنت ترمز...)"
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
              <div class="group-item" class:open={openGroups.has(group.id)}>
                <button
                  class="group-summary"
                  onclick={() => toggleGroup(group.id)}
                  type="button"
                  aria-expanded={openGroups.has(group.id)}
                >
                  <div class="summary-content">
                    <div class="group-icon">{group.icon}</div>
                    <div class="group-info">
                      <h3 class="group-title">{group.label}</h3>
                      <p class="group-subtitle">سرویس‌های دوره‌ای اصلی</p>
                    </div>
                  </div>
                  <span class="expand-icon" class:rotated={openGroups.has(group.id)}>▼</span>
                </button>
                {#if openGroups.has(group.id)}
                  <div class="group-items">
                    <ul class="items-list">
                      {#each group.items as item (item.value)}
                        <li>
                          <button
                            class="item-button"
                            class:selected={value === item.value}
                            onclick={() => selectItem(item.value)}
                            type="button"
                          >
                            <span class="item-label">{item.label}</span>
                            <span class="item-arrow">›</span>
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-back" onclick={() => { isExpanded = false; searchQuery = ''; openGroups.clear(); }} type="button">
            بازگشت
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .grouped-select-accordion {
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
    background: rgba(0, 0, 0, 0.7);
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
    max-width: 1024px;
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
    padding: 1.5rem;
    border-bottom: 2px solid var(--color-border);
    background: var(--color-bg-secondary);
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 1.5rem;
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
    width: 2.5rem;
    height: 2.5rem;
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
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    font-size: 1.1rem;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-light);
    background: var(--color-bg-primary);
  }

  /* Accordion Container */
  .accordion-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Group Item */
  .group-item {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.2s ease;
    display: block;
  }

  .group-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .group-item.open {
    border-color: var(--color-primary);
  }

  .group-summary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    cursor: pointer;
    background: var(--color-bg-primary);
    transition: all 0.2s ease;
    user-select: none;
    border: none;
    text-align: right;
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
    border-radius: 0.5rem;
    font-size: 1.5rem;
    background: var(--color-bg-secondary);
    flex-shrink: 0;
  }

  .group-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: right;
  }

  .group-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .group-subtitle {
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin: 0;
  }

  .expand-icon {
    font-size: 1.25rem;
    color: var(--color-text-light);
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  /* Group Items */
  .group-items {
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    display: block;
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 1000px;
    }
  }

  .items-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .item-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
    font-size: 0.875rem;
  }

  .item-button:hover {
    background: var(--color-bg-primary);
    color: var(--color-primary);
  }

  .item-button.selected {
    background: var(--color-primary);
    color: white;
  }

  .item-label {
    flex: 1;
  }

  .item-arrow {
    font-size: 1.125rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .item-button:hover .item-arrow {
    opacity: 1;
  }

  .item-button.selected .item-arrow {
    opacity: 1;
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
    padding: 1.5rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .btn-back {
    padding: 0.625rem 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-back:hover {
    background: var(--color-bg-secondary);
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
      padding: 1rem;
    }

    .modal-title {
      font-size: 1.25rem;
    }

    .search-box {
      padding: 1rem;
    }

    .accordion-container {
      padding: 1rem;
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
  }
</style>
