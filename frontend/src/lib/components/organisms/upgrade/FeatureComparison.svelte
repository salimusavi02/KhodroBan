<script lang="ts">
  /**
   * FeatureComparison Component
   * جدول مقایسه ویژگی‌های Free vs Pro
   */
  
  interface FeatureRow {
    free: boolean | string;
    pro: boolean | string;
    proPlus: boolean | string;
    label: string;
  }
  
  const features: FeatureRow[] = [
    { label: 'خودروهای قابل افزودن', free: '۲', pro: 'نامحدود', proPlus: 'نامحدود' },
    { label: 'سرویس‌های ثبت شده', free: 'نامحدود', pro: 'نامحدود', proPlus: 'نامحدود' },
    { label: 'هزینه‌های ثبت شده', free: 'نامحدود', pro: 'نامحدود', proPlus: 'نامحدود' },
    { label: 'یادآوری خودکار', free: true, pro: true, proPlus: true },
    { label: 'همگام‌سازی ابری', free: false, pro: true, proPlus: true },
    { label: 'خروجی PDF', free: false, pro: true, proPlus: true },
    { label: 'یادآور پیامکی', free: false, pro: true, proPlus: true },
    { label: 'گزارش‌های پیشرفته', free: false, pro: true, proPlus: true },
    { label: 'داشبورد اختصاصی', free: false, pro: false, proPlus: true },
    { label: 'گزارش‌های سفارشی', free: false, pro: false, proPlus: true },
    { label: 'API دسترسی', free: false, pro: false, proPlus: true },
    { label: 'همکاری تیمی', free: false, pro: false, proPlus: true },
    { label: 'پشتیبانی اولویت‌دار', free: false, pro: true, proPlus: true },
  ];
  
  function formatValue(value: boolean | string): string {
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    return value;
  }
  
  function getCellClass(value: boolean | string): string {
    if (typeof value === 'boolean') {
      return value ? 'cell-yes' : 'cell-no';
    }
    return 'cell-text';
  }
</script>

<div class="comparison-section">
  <div class="section-header">
    <h2 class="section-title">مقایسه کامل ویژگی‌ها</h2>
    <p class="section-subtitle">تفاوت‌های طرح رایگان و نسخه‌های Pro را مشاهده کنید</p>
  </div>

  <div class="comparison-table">
    <!-- Header Row -->
    <div class="table-row header-row">
      <div class="cell feature-name">ویژگی</div>
      <div class="cell plan-name">رایگان</div>
      <div class="cell plan-name highlighted">Pro</div>
      <div class="cell plan-name highlighted">Pro+</div>
    </div>

    <!-- Feature Rows -->
    {#each features as feature, index}
      <div class="table-row" class:highlighted={index % 2 === 0}>
        <div class="cell feature-name">
          {feature.label}
        </div>
        <div class="cell {getCellClass(feature.free)}">
          {formatValue(feature.free)}
        </div>
        <div class="cell {getCellClass(feature.pro)} highlighted-cell">
          {formatValue(feature.pro)}
        </div>
        <div class="cell {getCellClass(feature.proPlus)} highlighted-cell">
          {formatValue(feature.proPlus)}
        </div>
      </div>
    {/each}
  </div>

</div>

<style>
  .comparison-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .section-header {
    text-align: center;
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--space-sm) 0;
  }

  .section-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    margin: 0;
  }

  /* Comparison Table */
  .comparison-table {
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    overflow: hidden;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s ease;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row.highlighted {
    background: rgba(0, 0, 0, 0.02);
  }

  .table-row.header-row {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    font-weight: 600;
  }

  .cell {
    padding: var(--space-md);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: var(--font-size-sm);
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }

  .cell:last-child {
    border-right: none;
  }

  .feature-name {
    justify-content: flex-start;
    text-align: right;
    font-weight: 500;
    color: var(--color-text);
  }

  .header-row .feature-name {
    justify-content: flex-start;
    padding-right: var(--space-lg);
  }

  .plan-name {
    font-weight: 600;
  }

  .plan-name.highlighted {
    background: rgba(245, 158, 11, 0.1);
    font-weight: 700;
  }

  .highlighted-cell {
    background: rgba(245, 158, 11, 0.03);
  }

  /* Cell Types */
  .cell-yes {
    color: var(--color-success);
    font-weight: 700;
    font-size: var(--font-size-lg);
  }

  .cell-no {
    color: var(--color-text-muted);
    font-weight: 600;
    opacity: 0.4;
  }

  .cell-text {
    color: var(--color-primary);
    font-weight: 600;
    font-family: 'Vazirmatn', sans-serif;
  }

  /* Legend */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-lg);
    justify-content: center;
    padding: var(--space-lg);
    background: rgba(0, 0, 0, 0.02);
    border-radius: var(--glass-radius);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  .legend-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-weight: 700;
  }

  .legend-yes {
    background: var(--color-success-bg);
    color: var(--color-success);
  }

  .legend-no {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text-muted);
  }

  .legend-text {
    background: rgba(30, 58, 138, 0.1);
    color: var(--color-primary);
  }

  /* Responsive - Mobile */
  @media (max-width: 767px) {
    .comparison-table {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .table-row {
      min-width: 600px;
      grid-template-columns: 200px 100px 100px 100px;
    }

    .cell {
      padding: var(--space-sm);
      font-size: var(--font-size-xs);
    }

    .feature-name {
      padding-right: var(--space-md);
    }

    .legend {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm);
    }
  }

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    .table-row {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
    }

    .cell {
      padding: var(--space-md);
      font-size: var(--font-size-sm);
    }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    .table-row {
      grid-template-columns: 2fr 1fr 1fr 1fr;
    }

    .cell {
      padding: var(--space-lg);
      font-size: var(--font-size-base);
    }
  }
</style>
