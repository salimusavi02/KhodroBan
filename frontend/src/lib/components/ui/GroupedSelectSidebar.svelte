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

  // Set initial active group
  $effect(() => {
    if (isExpanded && !activeGroup && filteredGroups.length > 0) {
      activeGroup = filteredGroups[0].id;
    }
  });

  function selectItem(itemValue: string) {
    value = itemValue;
    isExpanded = false;
    searchQuery = '';
  }

  function selectGroup(groupId: string) {
    activeGroup = groupId;
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
    if (isExpanded && !activeGroup && filteredGroups.length > 0) {
      activeGroup = filteredGroups[0].id;
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

<div class="grouped-select-sidebar">
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
            placeholder="جستجو در خدمات..."
            value={searchQuery}
            oninput={handleSearchInput}
            class="search-input"
            aria-label="جستجو"
          />
        </div>

        <!-- Main Content -->
        <div class="content">
          <!-- Sidebar -->
          <aside class="sidebar">
            <h3 class="sidebar-title">دسته‌بندی‌ها</h3>
            <div class="sidebar-groups">
              {#each filteredGroups as group (group.id)}
                <button
                  class="sidebar-group"
                  class:active={activeGroup === group.id}
                  onclick={() => selectGroup(group.id)}
                  type="button"
                >
                  <div class="group-icon">{group.icon}</div>
                  <span class="group-label">{group.label}</span>
                  <span class="group-arrow">›</span>
                </button>
              {/each}
            </div>
          </aside>

          <!-- Items Grid -->
          <section class="items-section">
            {#if searchQuery && filteredGroups.flatMap(g => g.items).length === 0}
              <div class="no-results">
                <p>موردی یافت نشد</p>
              </div>
            {:else}
              {#each filteredGroups as group (group.id)}
                {#if activeGroup === group.id || searchQuery}
                  <div class="group-content">
                    <div class="group-header">
                      <span class="header-icon">{group.icon}</span>
                      <span class="header-label">{group.label}</span>
                    </div>
                    <p class="group-description">آیتم‌های سرویس مورد نظر را انتخاب کنید</p>
                    <div class="items-grid">
                      {#each group.items as item (item.value)}
                        <label class="item-card" class:selected={value === item.value}>
                          <input
                            type="radio"
                            name="grouped-select-item"
                            value={item.value}
                            checked={value === item.value}
                            onchange={() => selectItem(item.value)}
                            class="item-input"
                          />
                          <div class="item-content">
                            <div class="item-header">
                              <h4 class="item-title">{item.label}</h4>
                              {#if value === item.value}
                                <span class="item-check">✓</span>
                              {/if}
                            </div>
                          </div>
                        </label>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            {/if}
          </section>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <span class="selected-count">
            {#if selectedItem}
              {selectedItem.label}
            {:else}
              موردی انتخاب نشده
            {/if}
          </span>
          <div class="footer-actions">
            <button class="btn-secondary" onclick={() => { isExpanded = false; searchQuery = ''; }} type="button">
              بازگشت
            </button>
            <button class="btn-primary" onclick={() => { isExpanded = false; searchQuery = ''; }} type="button" disabled={!selectedItem}>
              تایید
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .grouped-select-sidebar {
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
    max-width: 1200px;
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

  /* Main Content */
  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 400px;
  }

  /* Sidebar */
  .sidebar {
    width: 250px;
    border-left: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text-light);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .sidebar-groups {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sidebar-group {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 2px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
    position: relative;
    overflow: hidden;
  }

  .sidebar-group::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-primary);
    opacity: 0.1;
    transition: opacity 0.2s ease;
  }

  .sidebar-group.active::before {
    opacity: 1;
  }

  .sidebar-group.active {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: white;
  }

  .sidebar-group:not(.active):hover {
    background: var(--color-bg-primary);
    border-color: var(--color-border);
  }

  .group-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: rgba(255, 179, 0, 0.2);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .sidebar-group.active .group-icon {
    background: rgba(255, 255, 255, 0.2);
  }

  .group-label {
    flex: 1;
    font-weight: 700;
    font-size: 0.875rem;
    position: relative;
    z-index: 1;
  }

  .group-arrow {
    font-size: 1.25rem;
    position: relative;
    z-index: 1;
  }

  /* Items Section */
  .items-section {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: var(--color-bg-primary);
  }

  .group-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--color-bg-secondary);
    border-radius: 0.75rem;
    font-weight: 700;
    font-size: 1.25rem;
    border: 2px solid var(--color-border);
  }

  .header-icon {
    font-size: 1.5rem;
  }

  .group-description {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin: 0;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .item-card {
    position: relative;
    cursor: pointer;
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    background: var(--color-bg-primary);
    transition: all 0.2s ease;
    display: block;
  }

  .item-card:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .item-card.selected {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: white;
  }

  .item-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-title {
    font-weight: 700;
    font-size: 1rem;
    margin: 0;
    color: var(--color-text-primary);
  }

  .item-card.selected .item-title {
    color: white;
  }

  .item-check {
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

  .item-card.selected .item-check {
    background: white;
    color: var(--color-primary);
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
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .selected-count {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-light);
  }

  .footer-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.625rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-secondary {
    border: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
  }

  .btn-secondary:hover {
    background: var(--color-bg-secondary);
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Scrollbar */
  .sidebar::-webkit-scrollbar,
  .items-section::-webkit-scrollbar {
    width: 8px;
  }

  .sidebar::-webkit-scrollbar-track,
  .items-section::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
    border-radius: 4px;
  }

  .sidebar::-webkit-scrollbar-thumb,
  .items-section::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  .sidebar::-webkit-scrollbar-thumb:hover,
  .items-section::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .modal-content {
      max-width: 95vw;
      max-height: 95vh;
    }

    .sidebar {
      width: 200px;
    }

    .items-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0.5rem;
    }

    .modal-content {
      max-height: 98vh;
    }

    .content {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      border-left: none;
      border-bottom: 1px solid var(--color-border);
      max-height: 200px;
    }

    .sidebar-groups {
      flex-direction: row;
      overflow-x: auto;
      gap: 0.5rem;
    }

    .sidebar-group {
      min-width: 120px;
      flex-direction: column;
      text-align: center;
    }

    .group-label {
      font-size: 0.75rem;
    }

    .items-section {
      min-height: 300px;
    }

    .items-grid {
      grid-template-columns: 1fr;
    }

    .modal-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .footer-actions {
      width: 100%;
    }

    .btn-secondary,
    .btn-primary {
      flex: 1;
    }
  }
</style>

