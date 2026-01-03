import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  integrations: [
    tailwind(),
    react(),
    mdx(),
  ],
});
