<script lang="ts">
  /**
   * PaymentInfo Component
   * نمایش اطلاعات روش پرداخت برای ارتقا به پلن Pro
   */
</script>

<div class="payment-info-section">
  <div class="payment-container glass">
    <div class="payment-header">
      <h3 class="payment-title">💳 روش پرداخت</h3>
      <p class="payment-description">
        برای فعال‌سازی پلن Pro یا Pro+، مبلغ را به شماره کارت زیر واریز کنید:
      </p>
    </div>

    <div class="card-info">
      <div class="card-number">۶۲۱۹-۸۶۱۹-۱۰۴۱-۷۸۴۸</div>
      <p class="card-details">بانک ملی - به نام: علم الهدی</p>
    </div>

    <div class="telegram-section">
      <p class="telegram-description">
        پس از واریز، رسید پرداخت را به آیدی تلگرام زیر ارسال کنید:
      </p>
      <a
        href="https://t.me/seyed_r_a_61"
        target="_blank"
        rel="noopener noreferrer"
        class="telegram-link"
        aria-label="ارسال پیام به تلگرام"
      >
        📱 @seyed_r_a_61
      </a>
    </div>

    <p class="processing-note">
      پس از بررسی، پلن شما در کمتر از ۲۴ ساعت فعال می‌شود
    </p>
  </div>
</div>

<style>
  .payment-info-section {
    width: 100%;
    padding: var(--space-xl) 0;
  }

  .payment-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-xl);
    text-align: center;
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--glass-shadow);
  }

  .payment-header {
    margin-bottom: var(--space-xl);
  }

  .payment-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-warning-light);
    margin: 0 0 var(--space-md) 0;
  }

  .payment-description {
    font-size: var(--font-size-base);
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  .card-info {
    background: rgba(255, 255, 255, 0.1);
    padding: var(--space-lg);
    border-radius: 10px;
    margin-bottom: var(--space-xl);
  }

  .card-number {
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--color-text);
    margin: var(--space-sm) 0;
    font-family: 'Courier New', monospace;
    direction: ltr;
    text-align: center;
  }

  .card-details {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    margin: var(--space-sm) 0 0 0;
  }

  .telegram-section {
    margin-bottom: var(--space-lg);
  }

  .telegram-description {
    font-size: var(--font-size-base);
    color: var(--color-text);
    margin: 0 0 var(--space-md) 0;
    line-height: 1.6;
  }

  .telegram-link {
    display: inline-block;
    background: rgba(59, 130, 246, 0.2);
    padding: var(--space-md) var(--space-lg);
    border-radius: 10px;
    color: var(--color-primary-light);
    text-decoration: none;
    font-weight: 600;
    font-size: var(--font-size-lg);
    transition: all 0.3s ease;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .telegram-link:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .telegram-link:focus {
    outline: 2px solid var(--color-primary-light);
    outline-offset: 2px;
  }

  .processing-note {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    margin: var(--space-lg) 0 0 0;
    line-height: 1.6;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .payment-container {
      padding: var(--space-lg);
    }

    .payment-title {
      font-size: var(--font-size-lg);
    }

    .card-number {
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .telegram-link {
      font-size: var(--font-size-base);
      padding: var(--space-sm) var(--space-md);
    }

    .payment-description,
    .telegram-description {
      font-size: var(--font-size-sm);
    }
  }

  @media (min-width: 768px) {
    .payment-container {
      padding: var(--space-2xl);
    }

    .payment-title {
      font-size: var(--font-size-2xl);
    }

    .card-number {
      font-size: 1.4rem;
    }
  }
</style>

