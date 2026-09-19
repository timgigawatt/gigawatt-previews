#!/usr/bin/env node
// npm run validate — runs the template validator once per lead folder
// (src/content/leads/<slug>/), each against the template's block schemas.
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const LEADS = join(ROOT, 'src/content/leads');
const slugs = existsSync(LEADS) ? readdirSync(LEADS).filter((d) => !d.startsWith('_') && statSync(join(LEADS, d)).isDirectory()) : [];
let failed = 0;
for (const slug of slugs) {
  try {
    const out = execFileSync('node', [join(ROOT, 'scripts/validate-one.mjs')], { env: { ...process.env, CONTENT_ROOT: `src/content/leads/${slug}` }, encoding: 'utf8' });
    console.log(`${slug}: ${out.trim()}`);
  } catch (e) { failed++; console.error(`${slug}:\n${(e.stdout || '') + (e.stderr || '')}`); }
}
if (failed) process.exit(1);
console.log(`✓ ${slugs.length} lead preview(s) valid`);
