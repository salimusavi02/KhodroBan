<script lang="ts">
  /**
   * PricingCard Component
   * کارت‌های قیمت‌گذاری برای طرح‌های مختلف
   */
  
  interface Props {
    selected?: 'pro' | 'pro+';
    currentTier?: string;
  }
  
  let { selected = $bindable('pro'), currentTier = 'free' }: Props = $props();
  
  interface PricingPlan {
    id: 'pro' | 'pro+';
    name: string;
    price: string;
    pricePeriod: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
  }
  
  const plans: PricingPlan[] = [
    {
      id: 'pro',
      name: 'Pro',
      price: '۹۹,۰۰۰',
      pricePeriod: 'تومان/ماه',
      highlighted: true,
      badge: 'محبوب‌ترین',
      features: [
        'خودروهای نامحدود',
        'همگام‌سازی ابری',
        'خروجی PDF',
        'یادآور پیامکی',
        'گزارش‌های پیشرفته',
        'پشتیبانی اولویت‌دار',
      ],
    },
    {
      id: 'pro+',
      name: 'Pro+',
      price: '۱۴۹,۰۰۰',
      pricePeriod: 'تومان/ماه',
      features: [
        'تمامی ویژگی‌های Pro',
        'داشبورد اختصاصی',
        'گزارش‌های سفارشی',
        'اولویت پشتیبانی',
        'API دسترسی',
        'همکاری تیمی',
      ],
    },
  ];
  
  function selectPlan(planId: 'pro' | 'pro+') {
    if (currentTier === 'free') {
      selected = planId;
    }
  }
  
  function isSelected(planId: 'pro' | 'pro+') {
    return selected === planId;
  }
  
  function isCurrentTier(planId: 'pro' | 'pro+') {
    return currentTier === planId;
  }
  
  function isDisabled(planId: 'pro' | 'pro+') {
    return currentTier !== 'free';
  }
</script>

<div class="pricing-section">
  <div class="section-header">
    <h2 class="section-title">انتخاب طرح مناسب</h2>
    <p class="section-subtitle">همه طرح‌ها شامل ۷ روز آزمایشی رایگان هستند</p>
  </div>

  <div class="pricing-grid">
    {#each plans as plan}
      <div
        class="pricing-card"
        class:highlighted={plan.highlighted}
        class:selected={isSelected(plan.id)}
        class:current={isCurrentTier(plan.id)}
        class:disabled={isDisabled(plan.id)}
        onclick={() => selectPlan(plan.id)}
        role="button"
        tabindex={isDisabled(plan.id) ? -1 : 0}
        onkeypress={(e) => {
          if (e.key === 'Enter' && !isDisabled(plan.id)) {
            selectPlan(plan.id);
          }
        }}
      >
        <!-- Badge -->
        {#if plan.badge && !isCurrentTier(plan.id)}
          <div class="badge-popular">
            {plan.badge}
          </div>
        {/if}

        <!-- Current Tier Indicator -->
        {#if isCurrentTier(plan.id)}
          <div class="badge-current">
            ✅ طرح فعلی شما
          </div>
        {/if}

        <!-- Header -->
        <div class="card-header">
          <h3 class="plan-name">{plan.name}</h3>
          <div class="plan-price">
            <span class="price-amount">{plan.price}</span>
            <span class="price-period">{plan.pricePeriod}</span>
          </div>
        </div>

        <!-- Features -->
        <ul class="features-list">
          {#each plan.features as feature}
            <li class="feature-item">
              <span class="feature-check">✓</span>
              <span class="feature-text">{feature}</span>
            </li>
          {/each}
        </ul>

        <!-- Selection Indicator -->
        <div class="selection-indicator">
          {#if isSelected(plan.id)}
            <span class="selected-icon">✓</span>
            <span class="selected-text">انتخاب شده</span>
          {:else if isCurrentTier(plan.id)}
            <span class="current-text">استفاده فعلی</span>
          {:else if isDisabled(plan.id)}
            <span class="disabled-text">غیرقابل انتخاب</span>
          {:else}
            <span class="select-text">انتخاب این طرح</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Free Plan Info -->
  <div class="free-plan-info">
    <div class="free-icon">🆓</div>
    <div class="free-text">
      <strong>طرح رایگان فعلی:</strong>
      <span>خودروهای محدود (۲ خودرو) - ویژگی‌های پایه</span>
    </div>
  </div>
</div>

<style>
  .pricing-section {
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

  /* Pricing Grid */
  .pricing-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  @media (min-width: 768px) {
    .pricing-grid {
      flex-direction: row;
      gap: var(--space-lg);
    }
  }

  /* Pricing Card */
  .pricing-card {
    position: relative;
    flex: 1;
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 2px solid var(--glass-border);
    border-radius: var(--glass-radius);
    padding: var(--space-lg);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .pricing-card:hover:not(.disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .pricing-card.highlighted {
    border-color: rgba(245, 158, 11, 0.5);
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.05) 0%,
      rgba(249, 115, 22, 0.05) 100%
    );
  }

  .pricing-card.selected {
    border-color: #f59e0b;
    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.1) 0%,
      rgba(249, 115, 22, 0.1) 100%
    );
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
  }

  .pricing-card.current {
    border-color: var(--color-success);
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.05) 0%,
      rgba(52, 211, 153, 0.05) 100%
    );
  }

  .pricing-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Badges */
  .badge-popular {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    color: white;
    padding: var(--space-xs) var(--space-md);
    border-radius: 9999px;
    font-size: var(--font-size-xs);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .badge-current {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-success);
    color: white;
    padding: var(--space-xs) var(--space-md);
    border-radius: 9999px;
    font-size: var(--font-size-xs);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  /* Card Header */
  .card-header {
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: var(--space-lg);
  }

  .plan-name {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--space-sm) 0;
  }

  .plan-price {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .price-amount {
    font-size: var(--font-size-2xl);
    font-weight: 800;
    color: var(--color-primary);
    font-family: 'Vazirmatn', sans-serif;
  }

  .price-period {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  /* Features List */
  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) 0;
  }

  .feature-check {
    color: var(--color-success);
    font-weight: 700;
    font-size: var(--font-size-lg);
    flex-shrink: 0;
  }

  .feature-text {
    font-size: var(--font-size-sm);
    color: var(--color-text);
    line-height: 1.5;
  }

  /* Selection Indicator */
  .selection-indicator {
    text-align: center;
    padding-top: var(--space-md);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    font-weight: 600;
    font-size: var(--font-size-sm);
  }

  .selected-icon {
    color: #f59e0b;
    font-size: var(--font-size-lg);
    margin-left: var(--space-xs);
  }

  .selected-text {
    color: #f59e0b;
  }

  .current-text {
    color: var(--color-success);
  }

  .disabled-text {
    color: var(--color-text-muted);
  }

  .select-text {
    color: var(--color-primary);
  }

  /* Free Plan Info */
  .free-plan-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: rgba(0, 0, 0, 0.02);
    border: 1px dashed var(--color-text-muted);
    border-radius: var(--glass-radius);
    text-align: right;
  }

  .free-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .free-text {
    flex: 1;
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  .free-text strong {
    display: block;
    font-size: var(--font-size-base);
    margin-bottom: var(--space-xs);
    color: var(--color-text);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .pricing-card {
      padding: var(--space-md);
      gap: var(--space-md);
    }

    .plan-name {
      font-size: var(--font-size-lg);
    }

    .price-amount {
      font-size: var(--font-size-xl);
    }

    .features-list {
      gap: var(--space-xs);
    }

    .free-plan-info {
      flex-direction: column;
      text-align: center;
      gap: var(--space-sm);
    }
  }
</style>
