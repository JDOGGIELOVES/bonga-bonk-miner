# Grok Searcher - Next.js App Router Architecture Plan

## Goals
- Move from single long static HTML page + 50+ separate .html files to a proper, maintainable multi-page Next.js site.
- Improve SEO (Metadata API, sitemap, robots, structured data).
- Better UX: clean navigation, focused pages instead of endless scrolling.
- Maintain (and improve) the high-value copy-paste prompt content.
- Make the site a true "hub" for Grok users.

## High-Level Route Structure

```
/                              → Homepage (clean hub)
├── /best-grok-prompts         → 50 Best Grok Prompts (categorized sections + copy)
├── /best-grok-image-prompts   → Best Grok Image Prompts
├── /comparisons               → Comparisons landing + subpages
│   ├── /grok-vs-chatgpt
│   ├── /grok-vs-gemini
│   └── /grok-vs-claude
├── /grok-search               → How to Search with Grok (research guide)
├── /memes                     → Best Grok Memes ("I'm Tired Boss")
├── /categories                → Browse all categories (grid + search)
│   └── /grok-for/[slug]       → Dynamic profession pages (business, marketing, engineers, etc.)
├── /blog                      → Blog / Guides hub
│   └── /blog/[slug]           → Individual long-form articles
└── (future) /pricing, /how-to-use-grok, etc.
```

## Navigation (as requested)
Persistent top nav:
**Home | Best Prompts | Image Prompts | Comparisons | Categories | Blog**

- Logo links to home.
- "Open in Grok" or external CTAs where appropriate.
- Mobile: hamburger or simple stacked.

## Key Pages & Responsibilities

### Homepage (app/page.tsx)
- Clean hero + tagline + global search input (client-side filters featured items or suggests pages).
- **Featured Resources** grid (6-8 high-traffic cards with images): Best Prompts, Image Prompts, Grok vs..., Search Guide, Memes, Business, etc.
- **Explore Categories** section (top 12 or so profession cards + "Browse all categories" link).
- Short value sections: "Why Grok Searcher", real-time X advantage, etc.
- No 20+ card wall.

### Content Pages
- Use consistent layout: sticky header nav, main content with good typography, prompt cards.
- **PromptCard** component: prompt text in mono, Copy button (client), optional category tag.
- Many prompts per page grouped by section (General, Productivity, Coding...).

### Categories System
- Central data in `lib/categories.ts` and `lib/prompts.ts`.
- Dynamic route `app/grok-for/[slug]/page.tsx` using `generateStaticParams()`.
- Each category page has: intro, why it works, use cases, list of prompts, JSON-LD.
- /categories = filterable grid of all professions.

### Data Model (planned)
```ts
type Prompt = { id: string; text: string; category?: string; }
type Category = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  prompts: Prompt[];
  faqs?: {q: string, a: string}[];
}
```

We will seed from the best existing HTMLs first, then expand.

## SEO & Technical

- **Metadata API**: 
  - Root layout base metadata.
  - Per-page `export const metadata` or `generateMetadata`.
  - Full `openGraph`, `twitter` cards with specific images from `/images/`.
- **Sitemap**: `app/sitemap.ts` (static routes + dynamic categories).
- **robots.txt**: `app/robots.ts`.
- **Structured Data**:
  - WebSite + Organization in layout.
  - Article + FAQPage on content pages.
  - BreadcrumbList where useful.
- Canonical URLs, proper headings (one H1 per page).

## Components

- `components/Nav.tsx`
- `components/Footer.tsx` (links + "Last updated: October 2025" or build-time)
- `components/PromptCard.tsx` (copy to clipboard + nice UI)
- `components/CategoryCard.tsx`
- `components/JsonLd.tsx` (reusable for structured data)

## Styling
- Tailwind (via Next setup).
- Keep familiar aesthetic: clean white cards on gray-50, bold headings, black accents, rounded-2xl.
- Responsive grids (5-col featured on desktop → 1-2 on mobile).
- No more Tailwind CDN.

## Footer
- Primary nav links
- Secondary: Sitemap, Twitter/X share, etc.
- "Last updated" date
- Disclaimer: "Not affiliated with xAI"

## Migration & Phasing
1. Scaffold + Layout + Nav/Footer + Homepage redesign
2. Core high-traffic pages (Best Prompts, Image Prompts, Comparisons, Search, Memes)
3. Dynamic categories + data centralization
4. Blog + additional pages
5. Full SEO (sitemap, metadata, JSON-LD everywhere)
6. Polish (search improvements, loading states, OG image handling)
7. Remove old .html files, update vercel.json if needed, deploy

## Deployment
- Will still be deployed by `cd "Grok Searcher" && npx vercel --prod --yes`
- Vercel will detect Next.js automatically after setup.
- Images served from /public.
- Keep @vercel/analytics.

## Benefits
- Much better crawlability and indexation.
- Faster perceived performance (React + RSC).
- Easy to maintain and expand (data-driven pages).
- Professional UX matching modern SEO/content sites.
- Dynamic metadata per page.

This plan keeps the spirit and value of the existing content while giving it proper modern web architecture.
