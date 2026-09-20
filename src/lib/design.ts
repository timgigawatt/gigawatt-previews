// GIGAWATT-BLOCKS personalities: src/design/personalities/<name>.json → custom properties on :root.
// Switching personality changes only these properties, three variant defaults and the flags;
// blocks never read the personality name. Reference: previews/design-system.md
const files = import.meta.glob<{ default: Personality }>('/src/design/personalities/*.json', { eager: true });

export interface FontFile { family: string; file: string; weight: string; style?: 'normal' | 'italic' }
export interface Personality {
  name: string;
  for: string;
  voice: string;
  move: string;
  fonts: { display: string; body: string; files: FontFile[] };
  colors: { light: Record<string, string>; dark: Record<string, string> };
  tokens?: Record<string, string>;
  variants: { services: string; stats: string; gallery: string };
  flags: Record<string, boolean | undefined>;
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

const colorLines = (c: Record<string, string>) => Object.entries(c).map(([k, v]) => `--gw-color-${k}:${v};`).join('');

/** The personality's declarations: fonts, light colors, token overrides; dark colors under [data-mode="dark"].
 *  Emitted on html[data-personality] (not :root) so they beat tokens.css's :root fallbacks regardless
 *  of where Astro injects the bundled stylesheet. */
export function personalityCss(p: Personality): string {
  const root = [
    `--gw-font-display:${p.fonts.display};`,
    `--gw-font-body:${p.fonts.body};`,
    colorLines(p.colors.light),
    ...Object.entries(p.tokens ?? {}).map(([k, v]) => `${k}:${v};`),
  ].join('');
  const dark = colorLines(p.colors.dark);
  const sel = `html[data-personality="${p.name}"]`;
  return `${sel}{${root}}` + (dark ? `${sel}[data-mode="dark"]{${dark}}` : '');
}

/** @font-face rules for the self-hosted files under public/fonts/. */
export function fontFaceCss(p: Personality): string {
  return p.fonts.files.map((f) =>
    `@font-face{font-family:"${f.family}";src:url(/fonts/${f.file}) format("woff2");font-weight:${f.weight};font-style:${f.style ?? 'normal'};font-display:swap;}`
  ).join('');
}

/** Files to preload: the first display and body file of the personality. */
export function fontPreloads(p: Personality): string[] {
  const first = (family: string) => p.fonts.files.find((f) => family.includes(`"${f.family}"`) && (f.style ?? 'normal') === 'normal')?.file;
  return [first(p.fonts.display), first(p.fonts.body)].filter((f): f is string => !!f);
}
