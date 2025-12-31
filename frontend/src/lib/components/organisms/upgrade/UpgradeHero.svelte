<script lang="ts">
  /**
   * UpgradeHero Component
   * هدر صفحه ارتقا به Pro با انیمیشن و توضیحات جذاب
   */
  
  import { onMount } from 'svelte';
  
  let showAnimation = $state(false);
  
  onMount(() => {
    setTimeout(() => {
      showAnimation = true;
    }, 100);
  });
</script>

<div class="upgrade-hero">
  <div class="hero-content">
    <!-- Animated Star Icon -->
    <div class="star-container" class:animate={showAnimation}>
      <span class="star-icon">🌟</span>
    </div>
    
    <!-- Title & Subtitle -->
    <div class="text-content" class:visible={showAnimation}>
      <h1 class="hero-title">ارتقا به نسخه Pro</h1>
      <p class="hero-subtitle">
        تمامی قابلیت‌های پیشرفته خودروبان را فعال کنید
      </p>
    </div>
    
    <!-- Benefits Preview -->
    <div class="benefits-preview" class:visible={showAnimation}>
      <div class="benefit-pill">
        <span class="benefit-icon">✓</span>
        <span>خودروهای نامحدود</span>
      </div>
      <div class="benefit-pill">
        <span class="benefit-icon">✓</span>
        <span>همگام‌سازی ابری</span>
      </div>
      <div class="benefit-pill">
        <span class="benefit-icon">✓</span>
        <span>خروجی PDF</span>
      </div>
    </div>
  </div>
</div>

<style>
  .upgrade-hero {
    background: linear-gradient(
      135deg,
      rgba(30, 58, 138, 0.05) 0%,
      rgba(245, 158, 11, 0.05) 100%
    );
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: var(--glass-radius);
    padding: var(--space-xl);
    text-align: center;
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
  }

  /* Star Animation */
  .star-container {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .star-container.animate {
    opacity: 1;
    transform: scale(1);
    animation: pulse-gold 2s infinite;
  }

  .star-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  @keyframes pulse-gold {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    }
    50% {
      box-shadow: 0 0 0 15px rgba(245, 158, 11, 0);
    }
  }

  /* Text Content */
  .text-content {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease 0.2s;
  }

  .text-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--space-sm) 0;
    background: linear-gradient(135deg, var(--color-primary) 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-light);
    margin: 0;
    line-height: 1.6;
  }

  /* Benefits Preview */
  .benefits-preview {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease 0.4s;
  }

  .benefits-preview.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .benefit-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 9999px;
    font-size: var(--font-size-sm);
    color: var(--color-text);
    font-weight: 500;
  }

  .benefit-icon {
    color: #f59e0b;
    font-weight: 700;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .upgrade-hero {
      padding: var(--space-2xl);
    }

    .star-container {
      width: 100px;
      height: 100px;
    }

    .star-icon {
      font-size: 3.5rem;
    }

    .hero-title {
      font-size: var(--font-size-3xl);
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
    }
  }

  @media (max-width: 480px) {
    .upgrade-hero {
      padding: var(--space-lg);
    }

    .star-container {
      width: 64px;
      height: 64px;
    }

    .star-icon {
      font-size: 2rem;
    }

    .benefits-preview {
      gap: var(--space-xs);
    }

    .benefit-pill {
      padding: var(--space-xs) var(--space-sm);
      font-size: var(--font-size-xs);
    }
  }
</style>
