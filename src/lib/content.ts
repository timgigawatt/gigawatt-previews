import { getCollection } from 'astro:content';

// Netlify sets CONTEXT to "production" | "deploy-preview" | "branch-deploy".
// Locally it's unset. Only production hides drafts and future-dated entries; every
// branch deploy shows everything so it can be reviewed before approval.
export const isProduction = process.env.CONTEXT === 'production';

export function today(): Date {
  return new Date();
}

type Dated = { data: { draft?: boolean; pubDate: Date } };

export function isPublished(entry: Dated, now = today()): boolean {
  if (entry.data.draft) return false;
  return entry.data.pubDate.getTime() <= now.getTime();
}

// The one function pages use. In production it is the publish filter; elsewhere it
// returns everything and the layout shows a preview badge.
export async function getPublished(collection: 'posts' | 'events') {
  const all = await getCollection(collection);
  const kept = isProduction ? all.filter((e: Dated) => isPublished(e)) : all;
  return kept.sort((a: Dated, b: Dated) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function entryStatus(entry: Dated): 'draft' | 'scheduled' | 'published' {
  if (entry.data.draft) return 'draft';
  return isPublished(entry) ? 'published' : 'scheduled';
}
