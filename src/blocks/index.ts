// gigawatt-blocks stand-in. When the library is extracted (ROADMAP 6) this file becomes
// `export { blocks } from 'gigawatt-blocks'` and nothing else in the site changes.
// Every block: a component + a schema.json (validated by `npm run validate`, listed by
// `npm run context`). Announcement is a global, rendered by the layout, not a page block.
import Hero from './Hero/Hero.astro';
import TextSection from './TextSection/TextSection.astro';
import CardGrid from './CardGrid/CardGrid.astro';
import Announcement from './Announcement/Announcement.astro';

export const blocks = { Hero, TextSection, CardGrid } as const;
export { Announcement };
export type BlockName = keyof typeof blocks;
