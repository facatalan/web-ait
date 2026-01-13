import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.ai-thinking.io',
  output: 'static',
  adapter: netlify(),
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/login') &&
        !page.includes('/forgot-password') &&
        !page.includes('/reset-password') &&
        !page.includes('/api/') &&
        !page.includes('/comunidad') &&
        !page.endsWith('.md/'),
    }),
  ],
});
