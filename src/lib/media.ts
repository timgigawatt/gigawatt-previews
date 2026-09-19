import type { ImageMetadata } from 'astro';

// Per-lead media: src/content/leads/<slug>/media/<file>. Content references the bare filename.
const files = import.meta.glob<{ default: ImageMetadata }>('/src/content/leads/*/media/*.{webp,png,jpg,jpeg,avif,svg}', { eager: true });

export function resolveMedia(name: string, slug?: string): ImageMetadata {
  const hit = slug ? files[`/src/content/leads/${slug}/media/${name}`] : Object.entries(files).find(([p]) => p.endsWith(`/media/${name}`))?.[1];
  if (!hit) throw new Error(`Media not found: ${name}${slug ? ` (lead ${slug})` : ''}`);
  return hit.default;
}
