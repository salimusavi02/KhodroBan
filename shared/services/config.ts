/**
 * Configuration helper
 */

export const config = {
  redirectBaseUrl: import.meta.env.VITE_REDIRECT_BASE_URL || window.location.origin,
  backendType: (import.meta.env.VITE_BACKEND_TYPE || 'supabase') as 'mock' | 'supabase' | 'django',
};

