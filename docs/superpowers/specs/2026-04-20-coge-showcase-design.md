# CoGe Showcase — Design Spec

**Date:** 2026-04-20
**Author:** Giuseppe Oncia
**Status:** Draft, pending user review

## Summary

A standalone public marketing website for **CoGe · Cost Governance** — the cost allocation and resource management platform currently living in the `coge` private repository. The showcase is a bilingual (Italian / English) single-page long-scroll site, brand-agnostic so it can be pitched as a capability to multiple companies. No call-to-action, no demo form — pure narrative capability showcase.

The site is built as a new public repository `coge-showcase` under `github.com/giuseppeoncia`, implemented with Astro, deployed via GitHub Actions to GitHub Pages.

## Goals

- Present CoGe as a polished, modern capability in long-scroll storytelling format.
- Work equally well in Italian and English with a user-facing language toggle.
- Showcase real product screenshots for credibility plus custom illustrations for hero/emotional sections.
- Deploy zero-cost on GitHub Pages from a public repository, no custom domain initially.
- Stay fully brand-agnostic — no mention of Synclab or any employing company.

## Non-Goals (v1)

- Dark mode.
- Analytics (Plausible, Umami, Google Analytics).
- Blog, RSS feed, search functionality.
- External CMS — all content lives in the repo.
- Custom domain — initial URL is `https://giuseppeoncia.github.io/coge-showcase/`.
- Video or demo embed.
- Contact form (a footer email link suffices).
- Automatic PR preview deploys (GitHub Pages limitation accepted).
- Dark-mode versions of screenshots.

## Audience & Positioning

**Target audience:** technical and business stakeholders at multi-unit service companies (20–500 people) with mixed T&M and fixed-price project portfolios, evaluating the platform as a capability or reference.

**Positioning statement:** CoGe unifies cost allocation, budgets, timesheets, and analytics for business units that want to know exactly where every euro goes.

**Tone:** confident, technically precise, no marketing hype. Short sentences. Concrete numbers over adjectives. Italian and English as peers (idiomatic parallels, not literal translations).

## Information Architecture

Top-to-bottom single-page layout:

1. **Sticky header** — wordmark `CoGe · Cost Governance` left, anchor nav for chapters, language toggle IT/EN right.
2. **Hero** — headline, sub-head, custom illustrated dashboard mockup (indigo / pink gradient, not a real screenshot).
3. **Chapter 01 · The Problem** — 2–3 narrative sentences plus an abstract illustration (fragmented spreadsheet tiles representing pre-CoGe chaos).
4. **Chapter 02 · What CoGe Does** — four pillars with icons: Cost Allocation, Budget & Forecast, Resource Planning, Analytics.
5. **Chapter 03 · Feature Tour** — ten feature cards, each with a real screenshot and 30–50 words of microcopy (per language). Features:
   - Cost Allocation Code (CAC) lifecycle (draft → published, wizard, fixed-price + T&M)
   - Budget planning & variance
   - Timesheet management + Excel import
   - Resource workload
   - Productivity analytics
   - Skills matrix
   - Data quality alerts (current milestone)
   - Financials (actual vs. budget)
   - Configurable business settings
   - Role-based admin panel
6. **Chapter 04 · Under the Hood** — tech stack cards (Laravel 12, Filament 3, MongoDB 8, PHP 8.5, Docker Compose, Redis queue) plus a dual-layer architecture diagram (read-only Blade dashboard + Filament admin, both on the same MongoDB).
7. **Chapter 05 · Evolution** — vertical timeline extracted from `coge/CHANGELOG.md`. Cherry-picks ~8–10 milestone releases, each with version, date, and one-line highlight. Example entries: v3.15 Audit logging · v3.17 Baseline revision · v3.18 Data quality alerts.
8. **Chapter 06 · Who It's For** — narrative profile of the target organization: multi-unit service companies (20–500 people), mixed T&M + fixed-price, monthly forecast needs, finance/delivery teams currently stitching Excel and sparse BI together.
9. **Footer** — copyright year, link to the `coge-showcase` GitHub repository, contact email `giuseppe.oncia@gmail.com`.

## Visual Language

### Palette

- Background: `#fafafa` / `#ffffff`
- Primary: indigo `#6366f1`
- Accent gradient: `linear-gradient(135deg, #6366f1, #ec4899)` (hero + chapter dividers)
- Text primary: `#0f172a` (slate-900)
- Text secondary: `#475569` (slate-600)
- Surface / card: `#ffffff` with `border: 1px solid #e2e8f0`
- Hover tint: `#eef2ff` (indigo-50)

### Typography

- Headings: **Inter** 700, self-hosted via `@fontsource/inter` (no external CDN).
- Body: Inter 400 / 500, 17–18 px desktop, 16 px mobile.
- Chapter labels: uppercase, letter-spacing 2–3 px, indigo-600, 11 px.
- Numeric emphasis: **JetBrains Mono** with tabular numerals (also self-hosted).

### Layout

- Max width: 1200 px centered.
- Section vertical padding: 120–160 px desktop, 80–96 px mobile.
- Chapter divider: thin rule plus centered "CHAPTER 0X" label.

### Interactions

- Scroll-triggered reveal: fade + `translateY(20px)` on section enter via `IntersectionObserver` (vanilla JS, no animation framework).
- Sticky header compacts after scroll > 80 px (reduced padding, bottom border added).
- Language toggle: instant switch between `/it/` and `/en/` routes; preference persisted in `localStorage`.
- Feature tour cards: hover lift (`translateY(-4px)` + shadow boost).
- Timeline pips animate in when the timeline enters viewport.
- No parallax, no scroll-jacking, no scroll-snap.

### Accessibility

- Contrast: WCAG AA minimum, AAA where trivially achievable.
- `prefers-reduced-motion: reduce` disables all scroll-reveal and hover-lift animations.
- Focus states: visible indigo ring (2 px, high-contrast).
- Alt text mandatory on every screenshot and illustration.
- `<html lang="…">` updated to `it` or `en` per page.
- Heading hierarchy: single `<h1>` in hero, `<h2>` for chapter titles, `<h3>` for cards.

### Responsive

- Mobile-first; breakpoints at 640 / 1024 / 1280 px.
- Hero illustration scales proportionally.
- Feature tour grid: 3 columns desktop → 2 tablet → 1 mobile.
- Timeline remains vertical on all viewports.

### Performance targets

- Lighthouse ≥ 95 on all four axes (Performance, Accessibility, Best Practices, SEO).
- TTI < 1.5 s on simulated mid-tier mobile.
- Fonts self-hosted, subset to Latin Extended.
- Images served as AVIF with WebP fallback; lazy-load below the fold.

## Technical Architecture

### Repository layout

```
coge-showcase/
├── .github/workflows/deploy.yml
├── public/
│   ├── screenshots/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── ChapterDivider.astro
│   │   ├── FeatureCard.astro
│   │   ├── TechCard.astro
│   │   ├── TimelineItem.astro
│   │   ├── LangToggle.astro
│   │   ├── ScrollReveal.astro
│   │   └── illustrations/
│   │       ├── HeroIllustration.astro
│   │       ├── ProblemIllustration.astro
│   │       └── ArchitectureDiagram.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── features/
│   │   └── milestones/
│   ├── i18n/
│   │   ├── it.json
│   │   ├── en.json
│   │   └── index.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── it/index.astro
│   │   └── en/index.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Astro configuration

- `output: 'static'`
- `site: 'https://giuseppeoncia.github.io'`
- `base: '/coge-showcase'`
- `i18n: { defaultLocale: 'it', locales: ['it', 'en'] }`
- Integrations: `@astrojs/sitemap`, `@astrojs/mdx`, `astro-icon`, `@fontsource/inter`, `@fontsource/jetbrains-mono`.

### Content model

Content collections (defined in `src/content/config.ts` with Zod schemas):

- **`features`** — one MDX file per feature tour entry. Schema: `{ id: string, order: number, title_it: string, title_en: string, body_it: string, body_en: string, screenshot: string, icon: string }`.
- **`milestones`** — one MDX file per timeline entry. Schema: `{ version: string, date: string, title_it: string, title_en: string, blurb_it: string, blurb_en: string }`.

Short UI strings (header nav, footer, chapter labels, language toggle) live in `src/i18n/{it,en}.json` and are accessed through a small helper `t(key, lang)`.

Narrative long-form copy for hero, Chapter 01, Chapter 02, Chapter 04, Chapter 06 is inline in the per-language `pages/{it,en}/index.astro` files — localized independently, not mechanically translated.

### i18n strategy

- Two physical pages: `/it/index.astro` and `/en/index.astro`. No runtime language switching.
- `pages/index.astro` at the root resolves the target locale in this order: (1) `localStorage.coge-showcase-lang` if present, (2) `navigator.language` (Italian → `/it/`, anything else → `/en/`), (3) default `/it/`.
- The language toggle component swaps the URL path and writes the chosen locale into `localStorage.coge-showcase-lang` so future root visits honor the choice.
- `<html lang>` matches the current route.

### Screenshot workflow

- Capture manually from a local `coge` instance (`docker compose up -d`, `http://localhost:8000/admin`) at 1440 × 900 viewport.
- Mask any PII (names, emails, real customer identifiers) with light blur before export.
- Export each screenshot as AVIF (quality 80) and WebP (quality 85) using `sharp` or Astro's built-in image pipeline.
- Commit into `public/screenshots/` with the naming convention `feature-<id>.{avif,webp}`.
- Document the full process in `docs/screenshots-capture.md` inside the showcase repo.

### Build & deploy pipeline

- GitHub Actions workflow at `.github/workflows/deploy.yml`:
  - Triggers: push to `main`, manual `workflow_dispatch`.
  - Steps: checkout → setup Node 20 → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`.
- Repository settings: Pages source configured as "GitHub Actions".
- Final URL: `https://giuseppeoncia.github.io/coge-showcase/it/` and `/en/`.
- Local preview via `npm run preview`; no CI-served preview branches.

### Custom 404

- `public/404.html` provided — GitHub Pages serves it for any unknown path. Contains a bilingual "page not found" message with a link back to the home page in both locales.

## Copy Baseline (draft, revised during implementation)

Full IT + EN copy is produced during implementation based on `coge/README.md`, `coge/CHANGELOG.md`, and in-app feature names. The following seed copy locks tone and voice for the hero and opening chapters.

### Hero

- **IT headline:** *Governa costi e risorse. In un posto solo.*
  **Sub:** *CoGe è la piattaforma che unifica cost allocation, budget, timesheet e analytics per business unit che vogliono sapere davvero dove va ogni euro.*
- **EN headline:** *Cost and resource governance. One place.*
  **Sub:** *CoGe unifies cost allocation, budgets, timesheets and analytics for business units that want to know exactly where every euro goes.*

### Chapter 01 — The Problem

- **IT:** *Excel sparsi, timesheet in ritardo, budget che nessuno riconcilia. I costi reali si scoprono a consuntivo, quando è tardi. CoGe sposta la verità dei numeri dal Q+1 al giorno 1.*
- **EN:** *Scattered spreadsheets, late timesheets, budgets no one reconciles. Real costs surface at quarter-end, when it's too late. CoGe moves the truth of the numbers from Q+1 to day one.*

### Chapter 02 — Four pillars

- **Cost Allocation** — tracking per project, customer, unit, with a draft → published lifecycle.
- **Budget & Forecast** — revenue vs. cost planning with variance against actuals.
- **Resource Planning** — workload, productivity, skills matrix.
- **Analytics** — read-only dashboards over live data.

### Chapter 06 — Who It's For

- **IT:** *Società di servizi multi-unit, da 20 a 500 persone, con progetti T&M e fixed-price mischiati. Team finance e delivery che oggi ricuciono il quadro tra Excel sparsi e BI a macchia di leopardo. CoGe sostituisce quella frammentazione con un'unica fonte di verità.*
- **EN:** *Multi-unit service companies, 20 to 500 people, running mixed T&M and fixed-price portfolios. Finance and delivery teams currently stitching the picture together across scattered spreadsheets and patchy BI. CoGe replaces that fragmentation with a single source of truth.*

## Deliverables

- New public GitHub repository `giuseppeoncia/coge-showcase`.
- Green CI workflow deploying to GitHub Pages on every push to `main`.
- Live site at `https://giuseppeoncia.github.io/coge-showcase/it/` and `/en/`.
- `README.md` documenting `npm install`, `npm run dev`, `npm run build`, `npm run preview`, and deploy expectations.
- `docs/screenshots-capture.md` describing how to re-capture screenshots from a running `coge` instance.
- At least ten feature screenshots committed under `public/screenshots/`.
- Three custom illustration components (hero, problem, architecture diagram).

## Risks & Mitigations

- **Screenshot capture requires running CoGe with seeded realistic data.** Mitigation: a documented capture procedure (`docs/screenshots-capture.md`) and a manual PII-blur pass before commit. Not automated in CI.
- **Astro `base: '/coge-showcase'` breaks internal links if hard-coded.** Mitigation: a `<Link>` wrapper component that prefixes `import.meta.env.BASE_URL`, plus a lint rule forbidding hard-coded leading slashes in `href`.
- **Manual i18n routing duplicates content between `/it/` and `/en/`.** Mitigation: long narrative copy is intentionally duplicated (each locale is first-class, not a translation); short UI strings live in JSON files loaded through a `t(key, lang)` helper.
- **Writing full IT + EN copy doubles iteration cost.** Mitigation: copy is locked at the end of the content pass before visual polish iterations begin; polish does not re-touch copy.
- **GitHub Pages has no native PR preview.** Mitigation: local `npm run preview` during development; reviewers pull and run locally.
- **Custom 404 page required.** Mitigation: ship `public/404.html` as part of v1; verified manually post-deploy.

## Open Questions (resolved before implementation)

All resolved during brainstorming. Documented here for traceability:

- Target audience: brand-agnostic showcase for any multi-unit service company evaluating CoGe as a capability.
- Tech stack: Astro (static), Node 20.
- Deploy: GitHub Pages via GitHub Actions.
- Repo name and owner: `giuseppeoncia/coge-showcase`, public.
- Language strategy: bilingual IT / EN, user-facing toggle, localStorage-persisted preference.
- Visual direction: Modern SaaS (indigo primary, gradient accents, Linear / Vercel inspired).
- Product visualization: hybrid — custom illustrations in hero and emotional sections, real screenshots in the feature tour.
- Copy ownership: initial drafts produced by the implementing assistant based on `coge/README.md` and `coge/CHANGELOG.md`, reviewed by the author.
- Footer contact: `giuseppe.oncia@gmail.com`.
- Branding: wordmark `CoGe · Cost Governance`.
