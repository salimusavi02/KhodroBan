import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterDeno from '@deno/svelte-adapter';
import adapterNetlify from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
  },
  kit: {
    adapter:
      // اول Deno رو چک کن (چون Deno Deploy متغیر DENO_REGION یا DENO_DEPLOY رو داره)
      typeof process !== 'undefined' && (process.env.DENO_REGION || process.env.DENO_DEPLOY)
        ? adapterDeno()
        // بعد Netlify رو چک کن (Netlify متغیر NETLIFY داره)
        : typeof process !== 'undefined' && process.env.NETLIFY
          ? adapterNetlify()
          // fallback به adapter-auto (برای local و بقیه موارد)
          : adapterAuto(),
  },
};

export default config;
