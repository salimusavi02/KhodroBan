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
    adapter: (() => {
      // در محیط‌های بدون process (مثل بعضی buildهای قدیمی) ایمن باش
      if (typeof process === 'undefined') {
        return adapterAuto();
      }

      // Deno Deploy: متغیرهای DENO_REGION یا DENO_DEPLOY همیشه وجود دارن
      if (process.env.DENO_REGION || process.env.DENO_DEPLOY) {
        return adapterDeno();
      }

      // Netlify: متغیر NETLIFY=true همیشه در build و runtime وجود داره
      if (process.env.NETLIFY) {
        return adapterNetlify();
      }

      // local development یا محیط‌های دیگه
      return adapterAuto();
    })(),
  },
};

export default config;
