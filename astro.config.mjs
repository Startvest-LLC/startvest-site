// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://startvest.ai',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
