// Generated from the same content the build publishes, per _config/standards/seo.md — never
// hand-written. Every page here is noindex (previews never go live indexed), but the
// site-wide check still wants a sitemap that lists exactly what the build contains.
import type { APIRoute } from 'astro';
import { allLeads } from '../lib/leads';
import { personalityNames } from '../lib/design';
import { PRODUCTION_URL } from '../lib/site';

export const GET: APIRoute = () => {
  const routes = ['/', '/privacy/'];
  for (const lead of allLeads()) {
    routes.push(`/${lead.slug}/`);
    for (const name of Object.keys(lead.pages)) if (name !== 'home') routes.push(`/${lead.slug}/${name}/`);
  }
  for (const personality of personalityNames()) routes.push(`/system/${personality}/`);

  const urls = routes.map((r) => `  <url><loc>${new URL(r, PRODUCTION_URL).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
