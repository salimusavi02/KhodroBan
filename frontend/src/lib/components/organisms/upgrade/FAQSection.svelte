<script lang="ts">
  /**
   * FAQSection Component
   * سوالات متداول درباره ارتقا به Pro
   */
  
  interface FAQItem {
    question: string;
    answer: string;
  }
  
  const faqs: FAQItem[] = [
    {
      question: 'آیا می‌توانم هر زمان لغو کنم؟',
      answer: 'بله، شما می‌توانید هر زمان که بخواهید اشتراک خود را لغو کنید. دسترسی شما تا پایان دوره فعلی حفظ می‌شود و هزینه‌ای برای لغو دریافت نمی‌شود.'
    },
    {
      question: 'آیا اطلاعات من پس از لغو حذف می‌شود؟',
      answer: 'خیر، تمام اطلاعات و داده‌های شما حفظ می‌شود. شما فقط به ویژگی‌های Pro دسترسی نخواهید داشت، اما داده‌های قبلی شما باقی می‌مانند.'
    },
    {
      question: 'چگونه پرداخت انجام می‌شود؟',
      answer: 'پرداخت از طریق درگاه امن بانکی انجام می‌شود. تمامی تراکنش‌ها رمزنگاری شده و ایمن هستند. ما اطلاعات کارت شما را ذخیره نمی‌کنیم.'
    },
    {
      question: 'آیا ضمانت بازگشت وجه وجود دارد؟',
      answer: 'بله، ۷ روز آزمایشی رایگان دارید. اگر در این مدت راضی نبودید، می‌توانید بدون هیچ هزینه‌ای انصراف دهید.'
    },
    {
      question: 'چه تفاوتی بین Pro و Pro+ وجود دارد؟',
      answer: 'Pro برای استفاده شخصی مناسب است. Pro+ ویژگی‌های اضافی مانند داشبورد اختصاصی، گزارش‌های سفارشی، API دسترسی و همکاری تیمی دارد.'
    },
    {
      question: 'آیا می‌توانم از نسخه Pro روی چند دستگاه استفاده کنم؟',
      answer: 'بله، با همگام‌سازی ابری می‌توانید از اشتراک خود روی چندین دستگاه (موبایل، تبلت، کامپیوتر) استفاده کنید.'
    },
  ];
  
  let openIndex = $state<number | null>(null);
  
  function toggleFAQ(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<div class="faq-section">
  <div class="section-header">
    <h2 class="section-title">سوالات متداول</h2>
    <p class="section-subtitle">پاسخ سوالات رایج درباره ارتقا به Pro</p>
  </div>

  <div class="faq-list">
    {#each faqs as faq, index}
      <div class="faq-item" class:open={openIndex === index}>
        <button
          class="faq-question"
          onclick={() => toggleFAQ(index)}
          aria-expanded={openIndex === index}
          aria-controls="faq-answer-{index}"
        >
          <span class="question-text">{faq.question}</span>
          <span class="toggle-icon" class:open={openIndex === index}>+</span>
        </button>
        
        <div
          class="faq-answer"
          id="faq-answer-{index}"
          class:open={openIndex === index}
        >
          <div class="answer-content">
            {faq.answer}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Support Contact -->
  <div class="support-section">
    <div class="support-icon">💬</div>
    <div class="support-text">
      <strong>هنوز سوالی دارید؟</strong>
      <span>با پشتیبانی ما در تماس باشید</span>
    </div>
    <a href="mailto:support@khodroban.com" class="support-link">تماس با پشتیبانی</a>
  </div>
</div>

<style>
  .faq-section {
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

  /* FAQ List */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .faq-item {
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .faq-item.open {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.1);
  }

  .faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: none;
    border: none;
    cursor: pointer;
    text-align: right;
    transition: background-color 0.2s ease;
  }

  .faq-question:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .question-text {
    flex: 1;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.5;
  }

  .toggle-icon {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    transition: transform 0.3s ease;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-icon.open {
    transform: rotate(45deg);
    color: var(--color-danger);
  }

  /* FAQ Answer */
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
    background: rgba(0, 0, 0, 0.01);
  }

  .faq-answer.open {
    max-height: 500px;
    padding: 0 var(--space-lg) var(--space-lg) var(--space-lg);
  }

  .answer-content {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    line-height: 1.7;
    padding-top: var(--space-md);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* Support Section */
  .support-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    background: linear-gradient(
      135deg,
      rgba(30, 58, 138, 0.05) 0%,
      rgba(245, 158, 11, 0.05) 100%
    );
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: var(--glass-radius);
    text-align: center;
  }

  .support-icon {
    font-size: 2.5rem;
  }

  .support-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .support-text strong {
    font-size: var(--font-size-base);
    color: var(--color-text);
  }

  .support-text span {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  .support-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: var(--font-size-sm);
    transition: all 0.2s ease;
  }

  .support-link:hover {
    background: var(--color-primary-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .faq-question {
      padding: var(--space-md);
    }

    .question-text {
      font-size: var(--font-size-sm);
    }

    .toggle-icon {
      font-size: 1.25rem;
    }

    .faq-answer.open {
      padding: 0 var(--space-md) var(--space-md) var(--space-md);
    }

    .support-section {
      padding: var(--space-lg);
    }

    .support-icon {
      font-size: 2rem;
    }
  }

  @media (min-width: 768px) {
    .faq-question {
      padding: var(--space-xl);
    }

    .question-text {
      font-size: var(--font-size-lg);
    }

    .faq-answer.open {
      padding: 0 var(--space-xl) var(--space-xl) var(--space-xl);
    }

    .support-section {
      flex-direction: row;
      justify-content: space-between;
      text-align: right;
    }

    .support-text {
      align-items: flex-start;
    }

    .support-link {
      margin-right: auto;
    }
  }
</style>
