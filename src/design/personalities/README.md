# Personalities

One JSON per GIGAWATT-BLOCKS personality — `foundry`, `ledger`, `hearth`, `kinetic`, `clarity`
(plus `default`, the pre-system baseline, never picked for a new lead) — validated against
`_schema.json` by `npm run validate`. `globals/settings.json` `personality` in a lead folder
names one of these files; missing means `default`. The prose (who each is for, voice, move,
composition) is also in `previews/design-system.md` — keep the two in step; the JSON is what
renders, the markdown is what `lead-gen` 03_profile reads to pick.

What a personality sets: `fonts` (two families, self-hosted woff2 in `public/fonts/`, listed
under `fonts.files`; `Base.astro` emits the `@font-face` rules), `colors.light` + `colors.dark`
(→ `--gw-color-*`), `tokens` (overrides of the master scale in `../tokens.css`), `variants`
(defaults for the blocks that have more than one markup), `flags` (features blocks and the
chrome read), `composition` (the default homepage block order).

Source of record: the Claude Design project "Gigawatt System" (`tokens.json`). A change to a
personality is made there first, then transcribed here and into `design-system.md`.
