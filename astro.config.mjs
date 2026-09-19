import { defineConfig } from 'astro/config';

// Static only — every Gigawatt site is SSG on Netlify. Never change `output`.
export default defineConfig({
  output: 'static',
  site: process.env.URL || 'http://localhost:4321',
});
