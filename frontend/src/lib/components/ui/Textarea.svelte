<script lang="ts">
  interface Props {
    id?: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    class?: string;
  }

  let {
    id,
    value = $bindable(''),
    placeholder = '',
    rows = 3,
    label,
    required = false,
    disabled = false,
    error = '',
    class: className = ''
  }: Props = $props();
</script>

<div class="field {className}">
  {#if label}
    <label for={id} class="label">
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}
  
  <textarea
    {id}
    bind:value
    {placeholder}
    {rows}
    {disabled}
    {required}
    class="textarea {error ? 'error' : ''}"
    aria-invalid={error ? 'true' : 'false'}
  ></textarea>

  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .required {
    color: var(--color-danger);
    margin-left: 0.25rem;
  }

  .textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
    transition: all 0.2s;
  }

  .textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .textarea.error {
    border-color: var(--color-danger);
  }

  .textarea.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .error-message {
    font-size: 0.8rem;
    color: var(--color-danger);
    margin-top: 0.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .textarea {
      transition: none;
    }
  }
</style>

