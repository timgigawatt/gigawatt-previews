#!/usr/bin/env node
// npm run validate — every page's blocks against src/blocks/*/schema.json, and
// globals/announcements.json against the Announcement schema. Collections are validated
// by Astro (zod) at build. Exit 1 on any error. Referenced by
// _config/standards/content-editing.md.
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { loadBlocks, loadPages, readJson, validate, P, ROOT, listFiles } from './lib.mjs';

const blocks = loadBlocks();
const errors = [];

const hasSchemas = Object.keys(blocks).length > 0;
const PUBLIC_MEDIA = join(P.content, '../../public/media');
const checkMedia = (where, obj) => JSON.stringify(obj, (k, v) => {
  if (k === 'src' && typeof v === 'string' && !/^https?:|^\//.test(v) && !existsSync(join(P.media, v))) errors.push(`${where}: media "${v}" not found in src/assets/media/`);
  if (k === 'url' && typeof v === 'string' && v.startsWith('/media/') && !existsSync(join(PUBLIC_MEDIA, v.slice(7)))) errors.push(`${where}: "${v}" not found in public/media/`);
  return v;
});
for (const { file, page, blocks: list, shape } of loadPages()) {
  if (!page.title) errors.push(`${file}: missing "title"`);
  const raw = page.blocks ?? page.layout;
  if (!Array.isArray(raw)) { errors.push(`${file}: "${shape === 'cms-export' ? 'layout' : 'blocks'}" must be an array`); continue; }
  raw.forEach((b, i) => {
    const where = `${file} ${shape === 'cms-export' ? 'layout' : 'blocks'}[${i}]`;
    const name = b.block ?? b.blockType;
    if (!name) return errors.push(`${where}: missing block type`);
    if (hasSchemas) {
      if (!blocks[name]) return errors.push(`${where}: unknown block "${name}"`);
      if (name === 'Announcement') return errors.push(`${where}: Announcement is a global (globals/announcements.json), not a page block`);
      errors.push(...validate(blocks[name].schema, b).map((e) => `${where} ${e}`));
    }
    checkMedia(where, b);
  });
}
// Collections and globals: JSON must parse (readJson throws) and media must exist.
import { readdirSync, statSync } from 'node:fs';
for (const d of existsSync(P.content) ? readdirSync(P.content) : []) {
  const dir = join(P.content, d);
  if (d === 'pages' || !statSync(dir).isDirectory()) continue;
  for (const f of listFiles(dir, '.json')) { try { checkMedia(`src/content/${d}/${f}`, readJson(join(dir, f))); } catch (e) { errors.push(`src/content/${d}/${f}: ${e.message}`); } }
}

// Announcements are optional: only sites whose layout renders the Announcement block have the file.
const annPath = join(P.globals, 'announcements.json');
const ann = existsSync(annPath) && blocks.Announcement ? readJson(annPath) : { items: [] };
if (!Array.isArray(ann.items)) errors.push('globals/announcements.json: "items" must be an array');
else if (blocks.Announcement) {
  ann.items.forEach((a, i) => errors.push(...validate(blocks.Announcement.schema, a).map((e) => `globals/announcements.json items[${i}] ${e}`)));
  const today = new Date().toISOString().slice(0, 10);
  const active = ann.items.filter((a) => a.starts <= today && a.ends >= today);
  if (active.length > 1) errors.push(`globals/announcements.json: ${active.length} announcements active today — only one allowed; expire the others`);
}

if (hasSchemas) for (const g of ['nav.json', 'footer.json', 'settings.json']) if (!existsSync(join(P.globals, g))) errors.push(`globals/${g}: missing`);
// settings.personality names a GIGAWATT-BLOCKS personality (src/design/personalities/<name>.json); missing = default.
const PERSONALITIES = join(ROOT, 'src/design/personalities');
const settingsPath = join(P.globals, 'settings.json');
if (existsSync(settingsPath)) {
  const { personality } = readJson(settingsPath);
  if (personality !== undefined) {
    const known = readdirSync(PERSONALITIES).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.slice(0, -5));
    if (typeof personality !== 'string' || !known.includes(personality)) errors.push(`globals/settings.json: personality "${personality}" is not one of ${known.join(', ')} (src/design/personalities/)`);
  }
}
const personaSchema = readJson(join(PERSONALITIES, '_schema.json'));
for (const f of readdirSync(PERSONALITIES).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
  const p = readJson(join(PERSONALITIES, f));
  errors.push(...validate(personaSchema, p).map((e) => `src/design/personalities/${f} ${e}`));
  if (p.name !== f.slice(0, -5)) errors.push(`src/design/personalities/${f}: name "${p.name}" must equal the filename`);
}
for (const f of listFiles(P.media)) if (f !== f.toLowerCase() || /\s/.test(f)) errors.push(`src/assets/media/${f}: filenames must be lowercase with no spaces`);

if (errors.length) { console.error(errors.map((e) => `✗ ${e}`).join('\n')); process.exit(1); }
console.log(`✓ content valid — ${loadPages().length} pages, ${Object.keys(blocks).length} block schemas${hasSchemas ? `, ${ann.items.length} announcements` : ' (no local schemas: structure checks only)'}`);
