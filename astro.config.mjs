// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Build-time scan: any page that renders noindex must stay out of the sitemap.
// A sitemap that lists noindexed URLs is a contradiction search engines punish
// with reduced crawl trust (found 2026-07-19: 375 of 1,018 listed URLs were
// noindexed drafts). Signals scanned: `const draft = true`, inline
// `draft={true}`, and LandingLayout usage (always noindex).
const noindexPaths = new Set();
function scanPages(dir, urlBase) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { scanPages(full, `${urlBase}${entry}/`); continue; }
    if (!entry.endsWith('.astro')) continue;
    const src = readFileSync(full, 'utf8');
    if (/const draft = true/.test(src) || /draft=\{true\}/.test(src) || /from ['"].*LandingLayout\.astro['"]/.test(src)) {
      const slug = entry.replace('.astro', '');
      noindexPaths.add(slug === 'index' ? urlBase : `${urlBase}${slug}/`);
    }
  }
}
scanPages('./src/pages', '/');

export default defineConfig({
  site: 'https://danielgierach.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/privacy') &&
        !page.includes('/terms') &&
        !page.includes('/404') &&
        !page.includes('/dashboard') &&
        !page.includes('/lp/') &&
        !page.includes('/social-preview') &&
        !noindexPaths.has(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
