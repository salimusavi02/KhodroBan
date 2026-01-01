<script lang="ts">
  import { onMount } from 'svelte';
  import { Layout } from '$lib/components/layout';
  import { UpgradeHero } from '$lib/components/organisms/upgrade';
  import { PricingCard } from '$lib/components/organisms/upgrade';
  import { FeatureComparison } from '$lib/components/organisms/upgrade';
  import { FAQSection } from '$lib/components/organisms/upgrade';
  import { PaymentInfo } from '$lib/components/organisms/upgrade';
  import { upgradeService } from '$lib/services/upgradeService';
  import { toastStore } from '$lib/stores';
  import { navigateTo } from '$lib/utils/navigation';

  let selectedPlan = $state<'pro' | 'pro+'>('pro');
  let isLoading = $state(false);
  let currentTier = $state('free');

  onMount(async () => {
    try {
      const profile = await upgradeService.getCurrentPlan();
      currentTier = profile.tier;
      
      if (currentTier !== 'free') {
        toastStore.info('شما قبلاً ارتقا یافته‌اید');
        navigateTo('/settings');
      }
    } catch (error) {
      toastStore.error('خطا در بارگذاری اطلاعات');
    }
  });

  async function handleUpgrade() {
    if (currentTier !== 'free') {
      toastStore.warning('شما قبلاً ارتقا یافته‌اید');
      return;
    }

    isLoading = true;
    try {
      const { redirectUrl } = await upgradeService.upgrade(selectedPlan);
      
      // در نسخه واقعی به درگاه پرداخت منتقل می‌شوید
      toastStore.success('در حال انتقال به درگاه پرداخت...');
      
      // For demo purposes
      setTimeout(() => {
        toastStore.success('این یک دمو است. در نسخه واقعی به درگاه پرداخت منتقل می‌شوید.');
        isLoading = false;
      }, 1500);
      
      // در نسخه واقعی:
      // window.location.href = redirectUrl;
      
    } catch (error) {
      toastStore.error('خطا در ارتباط با سرور');
      isLoading = false;
    }
  }
</script>

<Layout headerTitle="ارتقا به Pro">
  <div class="page-container upgrade-page">
    <!-- Hero Section -->
    <UpgradeHero />

    <!-- Pricing Cards -->
    <PricingCard bind:selected={selectedPlan} currentTier={currentTier} />

    <!-- Feature Comparison -->
    <FeatureComparison />

    <!-- FAQ Section -->
    <FAQSection />

    <!-- Payment Info Section -->
    <PaymentInfo />

    <!-- CTA Section -->
    <div class="cta-section">
      <button
        class="cta-button"
        onclick={handleUpgrade}
        disabled={isLoading || currentTier !== 'free'}
        class:loading={isLoading}
      >
        {#if isLoading}
          <span class="spinner"></span>
          در حال پردازش...
        {:else if currentTier !== 'free'}
          شما ارتقا یافته‌اید
        {:else}
          شروع ارتقا به {selectedPlan === 'pro' ? 'Pro' : 'Pro+'}
        {/if}
      </button>
      
      {#if currentTier === 'free'}
        <p class="cta-hint">هیچ تعهدی وجود ندارد. هر زمان می‌توانید لغو کنید.</p>
      {/if}
    </div>
  </div>
</Layout>

<style>
  .upgrade-page {
    gap: var(--space-xl);
  }

  .cta-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    text-align: center;
  }

  .cta-button {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    color: white;
    padding: 1rem 3rem;
    font-size: 1.125rem;
    font-weight: 600;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 100%;
    max-width: 400px;
  }

  .cta-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6);
  }

  .cta-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .cta-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--color-text-muted);
    box-shadow: none;
  }

  .cta-button.loading {
    position: relative;
    color: transparent;
  }

  .spinner {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .cta-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    margin: 0;
  }

  @media (min-width: 768px) {
    .cta-button {
      width: auto;
      min-width: 300px;
    }
  }

  @media (max-width: 480px) {
    .cta-section {
      padding: var(--space-lg);
    }
    
    .cta-button {
      font-size: 1rem;
      padding: 0.875rem 2rem;
    }
  }
</style>
