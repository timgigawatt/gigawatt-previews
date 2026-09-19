// GIGAWATT-BLOCKS personalities: src/design/personalities/<name>.json → custom properties on :root.
// Switching personality changes only these properties and four variant flags; blocks never read
// the personality name. Reference: previews/design-system.md
const files = import.meta.glob<{ default: Personality }>('/src/design/personalities/*.json', { eager: true });

export interface Personality {
  name: string;
  for: string;
  voice: string;
  move: string;
  fonts: { display: string; body: string; files?: string[] };
  colors: Record<string, string>;
  flags: { hero: string; cards: string; nav: string; footer: string };
  tokens?: Record<string, string>;
  composition: string[];
}

const personalities = new Map<string, Personality>();
for (const [path, mod] of Object.entries(files)) {
  const m = path.match(/\/personalities\/([a-z][a-z0-9-]*)\.json$/);
  if (m) personalities.set(m[1], mod.default);
}

export const personalityNames = () => [...personalities.keys()].sort();

export function getPersonality(name?: string | null): Personality {
  const key = name ?? 'default';
  const p = personalities.get(key);
  if (!p) throw new Error(`Unknown personality "${key}" — see src/design/personalities/`);
  return p;
}

/** The :root declaration block for a personality: colors, fonts, and any token overrides. */
export function personalityCss(p: Personality): string {
  const lines = [
    `--gw-font-display: ${p.fonts.display};`,
    `--gw-font-body: ${p.fonts.body};`,
    ...Object.entries(p.colors).map(([k, v]) => `--gw-color-${k}: ${v};`),
    ...Object.entries(p.tokens ?? {}).map(([k, v]) => `${k}: ${v};`),
  ];
  return `:root{${lines.join('')}}`;
}

/** @font-face rules for self-hosted files listed under fonts.files (src/design/fonts/<file>). */
export function fontFaceCss(p: Personality): string {
  return (p.fonts.files ?? []).map((f) => {
    const m = f.match(/^([a-z0-9-]+?)(?:-(\d{3}))?(?:-(italic))?\.woff2$/i);
    const family = m?.[1].replace(/-/g, ' ') ?? f;
    return `@font-face{font-family:"${family}";src:url(/fonts/${f}) format("woff2");font-weight:${m?.[2] ?? '400'};font-style:${m?.[3] ?? 'normal'};font-display:swap;}`;
  }).join('');
}
