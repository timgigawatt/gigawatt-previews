// Every lead route (home + inner pages) plus the system pages. The index at / is Tim's and
// stays out. Origin comes from astro.config `site` (Netlify's URL at build).
import type { APIRoute } from 'astro';
import { allLeads } from '../lib/leads';
import { personalityNames } from '../lib/design';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('http://localhost:4321')).href.replace(/\/$/, '');
  const routes: string[] = [];
  for (const l of allLeads()) {
    routes.push(`/${l.slug}/`);
    for (const name of Object.keys(l.pages)) if (name !== 'home') routes.push(`/${l.slug}/${name}/`);
  }
  for (const p of personalityNames()) routes.push(`/system/${p}/`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((r) => `  <url><loc>${origin}${r}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
