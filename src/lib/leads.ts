// Every lead's mock site lives at src/content/leads/<slug>/{pages,globals}/*.json — the same
// shape the site template uses, copied from the workspace's leads/<slug>/artifacts/preview/.
const files = import.meta.glob<{ default: any }>('/src/content/leads/*/{pages,globals}/*.json', { eager: true });

export interface Lead {
  slug: string;
  pages: Record<string, any>;
  settings: any;
  nav: any;
  footer: any;
  announcements: { items: any[] };
}

const leads = new Map<string, Lead>();
for (const [path, mod] of Object.entries(files)) {
  const m = path.match(/^\/src\/content\/leads\/([^/]+)\/(pages|globals)\/([^/]+)\.json$/);
  if (!m) continue;
  const [, slug, kind, name] = m;
  if (slug.startsWith('_')) continue; // _example is documentation, never a route
  const lead = leads.get(slug) ?? { slug, pages: {}, settings: {}, nav: { items: [] }, footer: { columns: [], legal: '' }, announcements: { items: [] } };
  if (kind === 'pages') lead.pages[name] = mod.default;
  else if (name === 'settings') lead.settings = mod.default;
  else if (name === 'nav') lead.nav = mod.default;
  else if (name === 'footer') lead.footer = mod.default;
  else if (name === 'announcements') lead.announcements = mod.default;
  leads.set(slug, lead);
}

export const allLeads = () => [...leads.values()].sort((a, b) => a.slug.localeCompare(b.slug));
export const getLead = (slug: string) => leads.get(slug);

/** The one announcement active today, if any (validate guarantees at most one). */
export function activeAnnouncement(lead: Lead, now = new Date()): any | null {
  const today = now.toISOString().slice(0, 10);
  return lead.announcements.items.find((a) => a.starts <= today && a.ends >= today) ?? null;
}
