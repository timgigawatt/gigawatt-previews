// gigawatt-blocks stand-in. When the library is extracted (ROADMAP 6) this file becomes
// `export { blocks } from 'gigawatt-blocks'` and nothing else in the site changes.
// Every block: a component + a schema.json (validated by `npm run validate`, listed by
// `npm run context`). Announcement is a global, rendered by the layout, not a page block.
// The home composition per personality: previews/design-system.md.
import Hero from './Hero/Hero.astro';
import ProofRow from './ProofRow/ProofRow.astro';
import Marquee from './Marquee/Marquee.astro';
import Services from './Services/Services.astro';
import Stats from './Stats/Stats.astro';
import Gallery from './Gallery/Gallery.astro';
import PullQuote from './PullQuote/PullQuote.astro';
import Testimonials from './Testimonials/Testimonials.astro';
import CtaBand from './CtaBand/CtaBand.astro';
import ContactForm from './ContactForm/ContactForm.astro';
import Team from './Team/Team.astro';
import Pricing from './Pricing/Pricing.astro';
import PageHeader from './PageHeader/PageHeader.astro';
import TextSection from './TextSection/TextSection.astro';
import CardGrid from './CardGrid/CardGrid.astro';
import Announcement from './Announcement/Announcement.astro';

export const blocks = { Hero, ProofRow, Marquee, Services, Stats, Gallery, PullQuote, Testimonials, CtaBand, ContactForm, Team, Pricing, PageHeader, TextSection, CardGrid } as const;
export { Announcement };
export type BlockName = keyof typeof blocks;
