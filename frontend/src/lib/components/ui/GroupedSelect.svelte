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
  let activeGroup = $state<string | null>(null);
  let isExpanded = $state(false);

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

  function selectItem(itemValue: string) {
    value = itemValue;
    isExpanded = false;
    searchQuery = '';
  }

  function toggleGroup(groupId: string) {
    activeGroup = activeGroup === groupId ? null : groupId;
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
    if (isExpanded && !activeGroup && groups.length > 0) {
      activeGroup = groups[0].id;
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
    }
  }

  $effect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  });
</script>

<div class="grouped-select">
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
          <button class="close-btn" onclick={() => { isExpanded = false; searchQuery = ''; }} type="button" aria-label="بستن">
            ✕
          </button>
        </div>

        <!-- Search Box -->
        <div class="search-box">
          <input
            type="text"
            placeholder="جستجوی سرویس یا هزینه..."
            value={searchQuery}
            oninput={handleSearchInput}
            class="search-input"
            aria-label="جستجو"
          />
        </div>

        <!-- Main Content -->
        <div class="content">
          <!-- Group Tabs (Vertical) -->
          <div class="group-tabs">
            {#each filteredGroups as group (group.id)}
              <button
                class="group-tab"
                class:active={activeGroup === group.id}
                onclick={() => toggleGroup(group.id)}
                type="button"
              >
                <span class="tab-icon">{group.icon}</span>
                <span class="tab-label">{group.label}</span>
              </button>
            {/each}
          </div>

          <!-- Items List -->
          <div class="items-list">
            {#if searchQuery && filteredGroups.flatMap(g => g.items).length === 0}
              <div class="no-results">
                <p>موردی یافت نشد</p>
              </div>
            {:else}
              {#each filteredGroups as group (group.id)}
                {#if activeGroup === group.id || searchQuery}
                  <div class="group-section">
                    {#if !searchQuery}
                      <div class="group-header">
                        <span class="header-icon">{group.icon}</span>
                        <span class="header-label">{group.label}</span>
                      </div>
                    {/if}
                    {#each group.items as item (item.value)}
                      <button
                        class="item"
                        class:selected={value === item.value}
                        onclick={() => selectItem(item.value)}
                        type="button"
                      >
                        <span class="item-label">{item.label}</span>
                        {#if value === item.value}
                          <span class="checkmark">✓</span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .grouped-select {
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
    background: var(--color-bg-primary);
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .display:hover .arrow {
    background: var(--color-primary-light);
    color: var(--color-primary);
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
    max-width: 900px;
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

  .search-input::placeholder {
    color: var(--color-text-light);
    font-size: 1rem;
  }

  /* Main Content */
  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 400px;
  }

  /* Group Tabs */
  .group-tabs {
    width: 180px;
    border-left: 1px solid var(--color-border);
    overflow-y: auto;
    background: var(--color-bg-secondary);
    padding: 0.5rem;
  }

  .group-tab {
    width: 100%;
    padding: 1rem 0.75rem;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-primary);
    transition: all 0.2s ease;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    min-height: 80px;
    justify-content: center;
  }

  .group-tab:hover {
    background: var(--color-primary-light);
    transform: translateY(-2px);
  }

  .group-tab.active {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .tab-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .tab-label {
    text-align: center;
    line-height: 1.3;
    font-size: 0.85rem;
  }

  /* Items List */
  .items-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: var(--color-bg-primary);
  }

  .group-section {
    margin-bottom: 2rem;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--color-bg-secondary);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
    border: 2px solid var(--color-border);
  }

  .header-icon {
    font-size: 1.5rem;
  }

  .item {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid var(--color-border);
    background: var(--color-bg-primary);
    border-radius: 0.75rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    text-align: right;
    min-height: 60px;
  }

  .item:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    transform: translateX(8px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .item.selected {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary-dark);
    font-weight: 700;
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .item-label {
    flex: 1;
    font-size: 1.05rem;
    font-weight: 500;
  }

  .checkmark {
    font-weight: bold;
    font-size: 1.25rem;
    background: white;
    color: var(--color-primary);
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
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

  /* Scrollbar styling */
  .group-tabs::-webkit-scrollbar,
  .items-list::-webkit-scrollbar {
    width: 8px;
  }

  .group-tabs::-webkit-scrollbar-track,
  .items-list::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
    border-radius: 4px;
  }

  .group-tabs::-webkit-scrollbar-thumb,
  .items-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  .group-tabs::-webkit-scrollbar-thumb:hover,
  .items-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .modal-content {
      max-width: 95vw;
      max-height: 95vh;
    }

    .group-tabs {
      width: 140px;
    }

    .tab-icon {
      font-size: 1.75rem;
    }

    .tab-label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0.5rem;
    }

    .modal-content {
      flex-direction: column;
      max-height: 98vh;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-title {
      font-size: 1.25rem;
    }

    .content {
      flex-direction: column;
      min-height: auto;
    }

    .group-tabs {
      width: 100%;
      border-left: none;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.5rem;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .group-tab {
      min-width: 100px;
      min-height: 70px;
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .tab-icon {
      font-size: 1.5rem;
    }

    .tab-label {
      font-size: 0.75rem;
    }

    .items-list {
      min-height: 300px;
    }

    .item {
      min-height: 55px;
      padding: 0.875rem 1rem;
    }

    .item-label {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .modal-header {
      padding: 0.75rem;
    }

    .modal-title {
      font-size: 1.1rem;
    }

    .close-btn {
      width: 2rem;
      height: 2rem;
      font-size: 1.25rem;
    }

    .search-box {
      padding: 1rem;
    }

    .search-input {
      padding: 0.875rem 1rem;
      font-size: 1rem;
    }

    .group-tabs {
      gap: 0.25rem;
    }

    .group-tab {
      min-width: 80px;
      min-height: 60px;
      padding: 0.75rem 0.5rem;
    }

    .tab-icon {
      font-size: 1.25rem;
    }

    .tab-label {
      font-size: 0.7rem;
    }

    .items-list {
      padding: 0.75rem;
    }

    .group-header {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }

    .item {
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
    }

    .item-label {
      font-size: 0.95rem;
    }
  }
</style>