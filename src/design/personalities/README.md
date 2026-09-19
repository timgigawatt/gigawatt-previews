# Personalities

One JSON per GIGAWATT-BLOCKS personality, validated against `_schema.json` by `npm run validate`.
`globals/settings.json` `personality` in a lead folder names one of these files; missing means
`default`. The prose (who each is for, voice, move, composition) is also in
`previews/design-system.md` — keep the two in step; the JSON is what renders, the markdown is
what `lead-gen` 03_profile reads to pick.

Fonts: put the woff2 files in `public/fonts/` (named `<family>-<weight>[-italic].woff2`) and list them under `fonts.files`; `Base.astro`
emits the `@font-face` rules. Two families per personality, never more.
