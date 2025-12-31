<script lang="ts">
  import { onMount } from 'svelte';
  import { Layout } from '$lib/components/layout';
  import { Button, Spinner } from '$lib/components/ui';
  import { analyzeCarIssue, isAIServiceConfigured, getCurrentProviderInfo } from '$lib/services/ai';
  import type { AIModelMode } from '$lib/services/ai';
  import type { ChatMessage } from '$lib/types';
  import { toastStore } from '$lib/stores';

  let messages = $state<ChatMessage[]>([
    { 
      role: 'model', 
      text: 'سلام! من مشاور هوشمند خودروی شما هستم. چطور می‌توانم کمکتان کنم؟' 
    }
  ]);
  let input = $state('');
  let isLoading = $state(false);
  let image = $state<string | null>(null);
  let useDeepThinking = $state(false);
  let activeMode = $state<AIModelMode>('expert');
  let isConfigured = $state(false);
  let providerInfo = $state<{ provider: string; name: string } | null>(null);
  
  let chatEndRef: HTMLDivElement;
  let fileInputRef: HTMLInputElement;

  onMount(() => {
    isConfigured = isAIServiceConfigured();
    providerInfo = getCurrentProviderInfo();
    
    if (!isConfigured) {
      toastStore.warning('سرویس AI پیکربندی نشده است. لطفاً با مدیر سیستم تماس بگیرید.');
    }
  });

  function scrollToBottom() {
    chatEndRef?.scrollIntoView({ behavior: 'smooth' });
  }

  $effect(() => {
    scrollToBottom();
  });

  function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // بررسی حجم فایل (حداکثر 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastStore.error('حجم تصویر نباید بیشتر از 5 مگابایت باشد');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function getUserLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toastStore.warning('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
        return resolve(null);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => {
          toastStore.warning('امکان دسترسی به موقعیت مکانی وجود ندارد');
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }

  async function handleSend() {
    if (!input.trim() && !image) return;
    if (!isConfigured) {
      toastStore.error('سرویس AI پیکربندی نشده است');
      return;
    }

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: input, 
      image: image || undefined,
      isThinking: useDeepThinking,
      mode: activeMode
    };

    messages = [...messages, userMsg];
    const currentInput = input;
    const currentImage = image;
    input = '';
    image = null;
    isLoading = true;

    try {
      let locationData = undefined;
      if (activeMode === 'maps') {
        const pos = await getUserLocation();
        if (pos) {
          locationData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
        }
      }

      const base64Data = currentImage ? currentImage.split(',')[1] : undefined;
      const result = await analyzeCarIssue({
        prompt: currentInput,
        base64Image: base64Data,
        deepThinking: useDeepThinking,
        mode: activeMode,
        location: locationData
      });

      const groundingLinks = result.groundingChunks
        ?.filter((chunk: any) => chunk.maps)
        ?.map((chunk: any) => ({
          title: chunk.maps.title || "مشاهده در نقشه",
          uri: chunk.maps.uri
        }));

      messages = [...messages, { 
        role: 'model', 
        text: result.text,
        groundingLinks
      }];
    } catch (error) {
      console.error('AI Error:', error);
      toastStore.error('خطا در ارتباط با هوش مصنوعی. لطفاً دوباره تلاش کنید.');
      messages = [...messages, { 
        role: 'model', 
        text: 'متاسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.' 
      }];
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<Layout headerTitle="مشاور هوشمند">
  <div class="ai-consultant-container">
    <!-- Header -->
    <div class="consultant-header">
      <div class="header-content">
        <div class="header-icon">🤖</div>
        <div>
          <h2>مشاور هوشمند</h2>
          <p>پشتیبانی شده توسط هوش مصنوعی</p>
          {#if providerInfo}
            <p class="provider-info">Provider: {providerInfo.name}</p>
          {/if}
        </div>
      </div>

      <div class="mode-selector">
        <div class="mode-tabs">
          <button 
            class="mode-tab"
            class:active={activeMode === 'expert'}
            onclick={() => activeMode = 'expert'}
            disabled={isLoading}
          >
            دقیق (Pro)
          </button>
          <button 
            class="mode-tab"
            class:active={activeMode === 'fast'}
            onclick={() => activeMode = 'fast'}
            disabled={isLoading}
          >
            سریع (Lite)
          </button>
          <button 
            class="mode-tab"
            class:active={activeMode === 'maps'}
            onclick={() => activeMode = 'maps'}
            disabled={isLoading}
          >
            مکان‌یاب
          </button>
        </div>

        {#if activeMode === 'expert'}
          <div class="deep-thinking-toggle">
            <span>تفکر عمیق</span>
            <button 
              class="toggle-switch"
              class:active={useDeepThinking}
              onclick={() => useDeepThinking = !useDeepThinking}
              disabled={isLoading}
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container">
      {#each messages as msg (msg.text + msg.role + (msg.image || ''))}
        <div class="message-wrapper" class:user={msg.role === 'user'}>
          <div class="message-bubble" class:user={msg.role === 'user'}>
            {#if msg.image}
              <img src={msg.image} alt="Uploaded" class="message-image" />
            {/if}
            {#if msg.isThinking && msg.role === 'user'}
              <div class="message-meta">
                <span>🧠</span>
                <span>با تحلیل عمیق</span>
              </div>
            {/if}
            {#if msg.mode === 'fast' && msg.role === 'user'}
              <div class="message-meta">
                <span>⚡</span>
                <span>پاسخ سریع</span>
              </div>
            {/if}
            <p class="message-text">{msg.text}</p>
            
            {#if msg.groundingLinks && msg.groundingLinks.length > 0}
              <div class="grounding-links">
                <p class="grounding-title">منابع و مکان‌ها:</p>
                {#each msg.groundingLinks as link}
                  <a 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="grounding-link"
                  >
                    📍 {link.title}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
      
      {#if isLoading}
        <div class="message-wrapper">
          <div class="message-bubble loading">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="loading-text">در حال پردازش...</span>
          </div>
        </div>
      {/if}
      <div bind:this={chatEndRef} />
    </div>

    <!-- Input Area -->
    <div class="input-container">
      {#if image}
        <div class="image-preview">
          <img src={image} alt="Preview" />
          <button class="remove-image" onclick={() => image = null}>×</button>
        </div>
      {/if}
      
      <div class="input-wrapper">
        <input 
          type="file" 
          bind:this={fileInputRef} 
          onchange={handleImageUpload} 
          class="hidden" 
          accept="image/*" 
        />
        <button 
          class="icon-button"
          onclick={() => fileInputRef?.click()}
          aria-label="آپلود تصویر"
          disabled={isLoading}
        >
          📷
        </button>
        
        <input 
          type="text" 
          bind:value={input}
          onkeypress={handleKeyPress}
          placeholder={
            activeMode === 'maps' 
              ? "جستجوی مکان (مثلاً: تعویض روغنی‌های نزدیک من)" 
              : "سوال خود را بپرسید..."
          }
          class="text-input"
          disabled={isLoading || !isConfigured}
        />
        
        <button 
          class="send-button"
          onclick={handleSend}
          disabled={isLoading || (!input.trim() && !image) || !isConfigured}
        >
          ➤
        </button>
      </div>
    </div>
  </div>
</Layout>

<style>
  .ai-consultant-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
    gap: 1rem;
  }

  .consultant-header {
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    padding: 1rem;
    border-radius: var(--glass-radius);
    box-shadow: var(--glass-shadow);
    border: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-icon {
    font-size: 2rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 12px;
    color: white;
    flex-shrink: 0;
  }

  .header-content h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--color-text);
  }

  .header-content p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .provider-info {
    font-size: 0.625rem !important;
    color: var(--color-text-light) !important;
  }

  .mode-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .mode-tabs {
    display: flex;
    background: var(--color-bg);
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
  }

  .mode-tab {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-tab:hover:not(:disabled) {
    color: var(--color-text-light);
  }

  .mode-tab.active {
    background: white;
    color: var(--color-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .mode-tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .deep-thinking-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--color-text-muted);
    background: var(--color-bg);
    padding: 0.5rem 0.75rem;
    border-radius: 12px;
    border: 1px solid var(--color-bg-dark);
  }

  .toggle-switch {
    width: 32px;
    height: 16px;
    background: var(--color-bg-dark);
    border-radius: 9999px;
    position: relative;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
  }

  .toggle-switch.active {
    background: var(--color-primary);
  }

  .toggle-switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(16px);
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 24px;
    padding: 1rem;
    border: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message-wrapper {
    display: flex;
    justify-content: flex-start;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-bubble {
    max-width: 85%;
    padding: 1rem;
    border-radius: 16px;
    background: white;
    color: var(--color-text);
    border: 1px solid var(--color-bg-dark);
    border-top-right-radius: 4px;
  }

  .message-bubble.user {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    border-color: var(--color-primary-dark);
    border-top-right-radius: 16px;
    border-top-left-radius: 4px;
  }

  .message-image {
    max-width: 200px;
    width: 100%;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.5625rem;
    font-weight: 700;
    opacity: 0.6;
    margin-bottom: 0.25rem;
  }

  .message-text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .grounding-links {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .message-bubble:not(.user) .grounding-links {
    border-top-color: var(--color-bg-dark);
  }

  .grounding-title {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 0.5rem 0;
  }

  .message-bubble:not(.user) .grounding-title {
    color: var(--color-text-muted);
  }

  .grounding-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: background 0.2s;
  }

  .grounding-link:hover {
    background: rgba(255, 255, 255, 0.2);
    text-decoration: underline;
  }

  .message-bubble:not(.user) .grounding-link {
    color: var(--color-primary);
    background: var(--color-bg);
  }

  .message-bubble:not(.user) .grounding-link:hover {
    background: var(--color-bg-dark);
  }

  .message-bubble.loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .loading-dots {
    display: flex;
    gap: 0.25rem;
  }

  .loading-dots span {
    width: 6px;
    height: 6px;
    background: var(--color-primary);
    border-radius: 50%;
    animation: bounce 1.4s infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  .loading-text {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 700;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
  }

  .input-container {
    background: var(--glass-bg-solid);
    backdrop-filter: var(--glass-blur);
    padding: 1rem;
    border-radius: 28px;
    box-shadow: var(--glass-shadow);
    border: 1px solid var(--glass-border);
    position: relative;
  }

  .image-preview {
    position: absolute;
    bottom: calc(100% + 1rem);
    right: 1rem;
    width: 80px;
    height: 80px;
    margin-bottom: 0.5rem;
  }

  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    border: 4px solid white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .remove-image {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--color-danger);
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }

  .remove-image:hover {
    transform: scale(1.1);
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon-button {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    border: 1px solid var(--color-bg-dark);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .icon-button:hover:not(:disabled) {
    color: var(--color-primary);
    background: var(--color-bg-dark);
  }

  .icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .text-input {
    flex: 1;
    background: var(--color-bg);
    border: none;
    border-radius: 16px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
  }

  .text-input:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .text-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .send-button {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .send-button:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .hidden {
    display: none;
  }

  @media (max-width: 768px) {
    .ai-consultant-container {
      height: calc(100vh - 100px);
      padding: 0.5rem;
    }

    .consultant-header {
      padding: 0.75rem;
    }

    .mode-selector {
      flex-direction: column;
      align-items: stretch;
    }

    .mode-tabs {
      width: 100%;
    }

    .message-bubble {
      max-width: 90%;
    }

    .header-content h2 {
      font-size: 1rem;
    }
  }
</style>

