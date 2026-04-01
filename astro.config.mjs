// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.danielgierach.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/privacy') &&
        !page.includes('/terms') &&
        !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
