# CoGe Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (IT/EN) long-scroll Astro marketing site for CoGe · Cost Governance, deployed to GitHub Pages from a public `giuseppeoncia/coge-showcase` repo.

**Architecture:** Astro static site with two first-class locale routes (`/it/`, `/en/`), short UI strings in JSON (`t(key, lang)` helper), long narrative copy inline per locale, content collections for features & milestones. Light-only theme, indigo primary with indigo→pink gradient accents, Inter + JetBrains Mono self-hosted. Deployed via GitHub Actions to Pages at `/coge-showcase/` base path.

**Tech Stack:** Astro 5.x, Node 20, TypeScript, `@astrojs/sitemap`, `@astrojs/mdx`, `astro-icon`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, Vitest (for i18n helper unit test), GitHub Actions (`actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`).

Reference spec: `docs/superpowers/specs/2026-04-20-coge-showcase-design.md`.

---

## File Structure

```
coge-showcase/
├── .github/workflows/deploy.yml
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── docs/
│   ├── screenshots-capture.md
│   └── superpowers/ (existing)
├── public/
│   ├── 404.html
│   ├── favicon.svg
│   └── screenshots/          # feature-<id>.{avif,webp}, placeholders until real capture
└── src/
    ├── content/
    │   ├── config.ts         # Zod schemas for `features` + `milestones`
    │   ├── features/         # 10 MDX files
    │   └── milestones/       # ~10 MDX files (cherry-picked from coge/CHANGELOG.md)
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── Hero.astro
    │   ├── ChapterDivider.astro
    │   ├── FeatureCard.astro
    │   ├── TechCard.astro
    │   ├── TimelineItem.astro
    │   ├── LangToggle.astro
    │   ├── Link.astro        # BASE_URL-prefixing wrapper
    │   ├── ScrollReveal.astro
    │   └── illustrations/
    │       ├── HeroIllustration.astro
    │       ├── ProblemIllustration.astro
    │       └── ArchitectureDiagram.astro
    ├── i18n/
    │   ├── it.json
    │   ├── en.json
    │   ├── index.ts          # `t(key, lang)` helper
    │   └── index.test.ts
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── index.astro       # root locale-detect redirect
    │   ├── it/index.astro    # IT long-scroll
    │   └── en/index.astro    # EN long-scroll
    └── styles/
        └── global.css
```

File responsibility rules: one component = one section/card type. Narrative copy lives inline in `pages/{it,en}/index.astro` (intentionally duplicated per locale). Short UI strings routed through `i18n/{it,en}.json`. Content collections hold per-item data (feature entries, milestone entries).

---

## Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (temporary stub, overwritten in Task 9)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "coge-showcase",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@fontsource/inter": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "astro": "^5.0.0",
    "astro-icon": "^1.1.5"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://giuseppeoncia.github.io',
  base: '/coge-showcase',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: { prefixDefaultLocale: true },
  },
  integrations: [mdx(), sitemap(), icon()],
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.DS_Store
.env
.env.*
!.env.example
.vscode/
```

- [ ] **Step 5: Write temporary `src/pages/index.astro` stub**

```astro
---
---
<html lang="it"><body>scaffold OK</body></html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, `package-lock.json` created, no errors.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: `dist/` created, includes `index.html` (served at `/coge-showcase/`), exit 0.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "chore: scaffold Astro project with i18n + integrations"
```

---

## Task 2: Global styles + self-hosted fonts

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/jetbrains-mono/400.css';

:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e2e8f0;
  --hover-tint: #eef2ff;
  --primary: #6366f1;
  --primary-600: #4f46e5;
  --accent-pink: #ec4899;
  --gradient: linear-gradient(135deg, #6366f1, #ec4899);
  --text: #0f172a;
  --text-muted: #475569;
  --chapter-label: #4338ca;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --maxw: 1200px;
  --section-y: clamp(80px, 12vw, 160px);
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
@media (max-width: 640px) { body { font-size: 16px; } }

h1, h2, h3 { font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; margin: 0 0 0.5em; }
h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); }
h3 { font-size: 1.25rem; }

.chapter-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--chapter-label);
}

.mono, .num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.container {
  max-width: var(--maxw);
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 40px);
}

section.chapter { padding-block: var(--section-y); }

a { color: var(--primary-600); }
a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
  border-radius: 3px;
}

button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: exit 0. (Styles not imported yet — that happens in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): add global CSS with palette, typography, layout tokens"
```

---

## Task 3: BaseLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  lang: 'it' | 'en';
}

const { title, description, lang } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---
<!DOCTYPE html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create placeholder favicon**

Write `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <text x="32" y="42" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="28" fill="#ffffff">C</text>
</svg>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro public/favicon.svg
git commit -m "feat(layout): add BaseLayout with SEO meta + favicon"
```

---

## Task 4: i18n helper + unit test

**Files:**
- Create: `src/i18n/it.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/index.ts`
- Create: `src/i18n/index.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write `src/i18n/it.json`**

```json
{
  "nav.problem": "Il Problema",
  "nav.pillars": "Cosa Fa",
  "nav.features": "Feature",
  "nav.tech": "Sotto il Cofano",
  "nav.evolution": "Evoluzione",
  "nav.audience": "Per Chi",
  "lang.label": "Lingua",
  "lang.it": "IT",
  "lang.en": "EN",
  "chapter": "Capitolo",
  "footer.repo": "Repository",
  "footer.email": "Contatto",
  "footer.copyright": "© {year} Giuseppe Oncia. Tutti i diritti riservati.",
  "404.title": "Pagina non trovata",
  "404.back": "Torna alla home"
}
```

- [ ] **Step 2: Write `src/i18n/en.json`**

```json
{
  "nav.problem": "The Problem",
  "nav.pillars": "What It Does",
  "nav.features": "Features",
  "nav.tech": "Under the Hood",
  "nav.evolution": "Evolution",
  "nav.audience": "Who It's For",
  "lang.label": "Language",
  "lang.it": "IT",
  "lang.en": "EN",
  "chapter": "Chapter",
  "footer.repo": "Repository",
  "footer.email": "Contact",
  "footer.copyright": "© {year} Giuseppe Oncia. All rights reserved.",
  "404.title": "Page not found",
  "404.back": "Back to home"
}
```

- [ ] **Step 3: Write `src/i18n/index.ts`**

```ts
import it from './it.json';
import en from './en.json';

export type Lang = 'it' | 'en';
type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = { it, en };

export function t(key: string, lang: Lang, vars: Record<string, string | number> = {}): string {
  const raw = dicts[lang][key];
  if (raw === undefined) {
    throw new Error(`i18n: missing key "${key}" for lang "${lang}"`);
  }
  return raw.replace(/\{(\w+)\}/g, (_, v) => {
    if (!(v in vars)) {
      throw new Error(`i18n: missing variable "${v}" for key "${key}"`);
    }
    return String(vars[v]);
  });
}

export function assertParity(): void {
  const itKeys = Object.keys(it).sort();
  const enKeys = Object.keys(en).sort();
  const missing = itKeys.filter((k) => !(k in en)).concat(enKeys.filter((k) => !(k in it)));
  if (missing.length > 0) {
    throw new Error(`i18n: locale parity violation, keys missing: ${missing.join(', ')}`);
  }
}
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Write failing tests in `src/i18n/index.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { t, assertParity } from './index';

describe('t()', () => {
  it('returns IT string for known key', () => {
    expect(t('lang.it', 'it')).toBe('IT');
  });

  it('returns EN string for known key', () => {
    expect(t('lang.en', 'en')).toBe('EN');
  });

  it('interpolates variables', () => {
    expect(t('footer.copyright', 'en', { year: 2026 })).toContain('2026');
  });

  it('throws on unknown key', () => {
    expect(() => t('nope', 'it')).toThrow(/missing key/);
  });

  it('throws on missing variable', () => {
    expect(() => t('footer.copyright', 'it')).toThrow(/missing variable/);
  });
});

describe('assertParity()', () => {
  it('passes for parity IT/EN dictionaries', () => {
    expect(() => assertParity()).not.toThrow();
  });
});
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `npm test`
Expected: 6 passing. (Tests should pass immediately since step 3 already implemented the helper correctly — this is one case where "write test first, it passes" happens because the helper is small and complete. If any test fails, fix the helper.)

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ vitest.config.ts
git commit -m "feat(i18n): add t() helper, IT/EN dictionaries, parity check + tests"
```

---

## Task 5: `Link` wrapper component

**Files:**
- Create: `src/components/Link.astro`

- [ ] **Step 1: Write `src/components/Link.astro`**

```astro
---
interface Props {
  href: string;
  class?: string;
  'aria-label'?: string;
}
const { href, class: className, ...rest } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const isAbsolute = /^(https?:|mailto:|#)/.test(href);
const finalHref = isAbsolute ? href : `${base}${href.startsWith('/') ? '' : '/'}${href}`;
---
<a href={finalHref} class={className} {...rest}><slot /></a>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Link.astro
git commit -m "feat(components): add Link wrapper that prefixes BASE_URL"
```

---

## Task 6: Language toggle component

**Files:**
- Create: `src/components/LangToggle.astro`

- [ ] **Step 1: Write `src/components/LangToggle.astro`**

```astro
---
import { t, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<div class="lang-toggle" role="group" aria-label={t('lang.label', lang)}>
  <a
    href={`${base}/it/`}
    class:list={['opt', { active: lang === 'it' }]}
    aria-current={lang === 'it' ? 'page' : undefined}
    data-lang="it"
  >{t('lang.it', lang)}</a>
  <span class="sep" aria-hidden="true">/</span>
  <a
    href={`${base}/en/`}
    class:list={['opt', { active: lang === 'en' }]}
    aria-current={lang === 'en' ? 'page' : undefined}
    data-lang="en"
  >{t('lang.en', lang)}</a>
</div>

<script>
  const key = 'coge-showcase-lang';
  document.querySelectorAll<HTMLAnchorElement>('.lang-toggle a[data-lang]').forEach((el) => {
    el.addEventListener('click', () => {
      try { localStorage.setItem(key, el.dataset.lang!); } catch {}
    });
  });
</script>

<style>
  .lang-toggle {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .opt {
    color: var(--text-muted);
    text-decoration: none;
    padding: 4px 6px;
    border-radius: 4px;
  }
  .opt.active { color: var(--primary-600); font-weight: 700; }
  .opt:hover { background: var(--hover-tint); }
  .sep { color: var(--border); }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/LangToggle.astro
git commit -m "feat(components): add LangToggle with localStorage persistence"
```

---

## Task 7: Header component

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: Write `src/components/Header.astro`**

```astro
---
import { t, type Lang } from '../i18n';
import LangToggle from './LangToggle.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;

const anchors = [
  ['#problem', t('nav.problem', lang)],
  ['#pillars', t('nav.pillars', lang)],
  ['#features', t('nav.features', lang)],
  ['#tech', t('nav.tech', lang)],
  ['#evolution', t('nav.evolution', lang)],
  ['#audience', t('nav.audience', lang)],
] as const;
---
<header class="site-header" id="site-header">
  <div class="container row">
    <a href="#top" class="wordmark">
      <span class="w1">CoGe</span>
      <span class="dot">·</span>
      <span class="w2">Cost Governance</span>
    </a>
    <nav aria-label="Chapters">
      <ul>
        {anchors.map(([href, label]) => <li><a href={href}>{label}</a></li>)}
      </ul>
    </nav>
    <LangToggle lang={lang} />
  </div>
</header>

<script>
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('compact', window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
</script>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(250, 250, 250, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: padding 0.2s ease, border-color 0.2s ease;
    padding-block: 20px;
    border-bottom: 1px solid transparent;
  }
  .site-header.compact {
    padding-block: 10px;
    border-bottom-color: var(--border);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
  }
  .wordmark {
    text-decoration: none;
    color: var(--text);
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 16px;
  }
  .wordmark .dot { margin-inline: 6px; color: var(--primary); }
  .wordmark .w2 { color: var(--text-muted); font-weight: 500; }
  nav ul {
    list-style: none;
    display: flex;
    gap: 24px;
    margin: 0;
    padding: 0;
  }
  nav a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  nav a:hover { color: var(--primary-600); }

  @media (max-width: 1024px) {
    nav { display: none; }
  }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(components): add sticky Header with nav anchors + compact on scroll"
```

---

## Task 8: Footer component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Footer.astro`**

```astro
---
import { t, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container row">
    <p class="copyright">{t('footer.copyright', lang, { year })}</p>
    <ul class="links">
      <li>
        <a href="https://github.com/giuseppeoncia/coge-showcase" rel="noopener" target="_blank">
          {t('footer.repo', lang)}
        </a>
      </li>
      <li>
        <a href="mailto:giuseppe.oncia@gmail.com">{t('footer.email', lang)}</a>
      </li>
    </ul>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--border);
    padding-block: 48px;
    margin-top: 80px;
    background: var(--surface);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }
  .copyright {
    margin: 0;
    color: var(--text-muted);
    font-size: 14px;
  }
  .links {
    list-style: none;
    display: flex;
    gap: 24px;
    margin: 0;
    padding: 0;
  }
  .links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  .links a:hover { color: var(--primary-600); }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(components): add Footer with copyright, repo link, contact email"
```

---

## Task 9: Root locale-detect redirect

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Overwrite `src/pages/index.astro`**

```astro
---
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const itHref = `${base}/it/`;
const enHref = `${base}/en/`;
---
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CoGe · Cost Governance</title>
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content={`0;url=${itHref}`} />
    <script is:inline define:vars={{ itHref, enHref }}>
      (function () {
        try {
          var stored = localStorage.getItem('coge-showcase-lang');
          if (stored === 'it' || stored === 'en') {
            location.replace(stored === 'en' ? enHref : itHref);
            return;
          }
          var nav = (navigator.language || 'it').toLowerCase();
          location.replace(nav.startsWith('it') ? itHref : enHref);
        } catch (e) {
          location.replace(itHref);
        }
      })();
    </script>
  </head>
  <body>
    <p>
      <a href={itHref}>Italiano</a> · <a href={enHref}>English</a>
    </p>
  </body>
</html>
```

- [ ] **Step 2: Verify build produces redirect HTML**

Run: `npm run build`
Then inspect `dist/index.html` for the refresh meta + inline script.

Expected: file exists and contains `meta http-equiv="refresh"`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(pages): root redirect honors localStorage + navigator.language"
```

---

## Task 10: Hero section + HeroIllustration

**Files:**
- Create: `src/components/illustrations/HeroIllustration.astro`
- Create: `src/components/Hero.astro`
- Create: `src/pages/it/index.astro` (hero-only skeleton for now)
- Create: `src/pages/en/index.astro` (hero-only skeleton for now)

- [ ] **Step 1: Write `src/components/illustrations/HeroIllustration.astro`**

```astro
---
---
<div class="hero-illu" aria-hidden="true">
  <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dashboard mockup">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6366f1" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#ec4899" stop-opacity="0.18"/>
      </linearGradient>
      <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6366f1"/>
        <stop offset="1" stop-color="#ec4899"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" rx="20" fill="url(#bg)"/>
    <rect x="30" y="30" width="540" height="60" rx="10" fill="#ffffff" opacity="0.7"/>
    <rect x="50" y="48" width="120" height="12" rx="6" fill="#6366f1"/>
    <rect x="50" y="66" width="80" height="8" rx="4" fill="#cbd5e1"/>

    <rect x="30" y="110" width="170" height="90" rx="12" fill="#ffffff"/>
    <rect x="210" y="110" width="170" height="90" rx="12" fill="#ffffff"/>
    <rect x="390" y="110" width="180" height="90" rx="12" fill="#ffffff"/>

    <rect x="30" y="220" width="540" height="150" rx="12" fill="#ffffff"/>
    <g transform="translate(60,240)">
      <rect x="0"   y="90" width="30" height="30" fill="url(#bar)"/>
      <rect x="50"  y="60" width="30" height="60" fill="url(#bar)"/>
      <rect x="100" y="30" width="30" height="90" fill="url(#bar)"/>
      <rect x="150" y="70" width="30" height="50" fill="url(#bar)"/>
      <rect x="200" y="40" width="30" height="80" fill="url(#bar)"/>
      <rect x="250" y="20" width="30" height="100" fill="url(#bar)"/>
      <rect x="300" y="50" width="30" height="70" fill="url(#bar)"/>
      <rect x="350" y="10" width="30" height="110" fill="url(#bar)"/>
      <rect x="400" y="35" width="30" height="85" fill="url(#bar)"/>
      <rect x="450" y="25" width="30" height="95" fill="url(#bar)"/>
    </g>
  </svg>
</div>

<style>
  .hero-illu {
    width: 100%;
    max-width: 600px;
    margin-inline: auto;
    filter: drop-shadow(0 20px 40px rgba(99, 102, 241, 0.18));
  }
  .hero-illu svg { width: 100%; height: auto; display: block; }
</style>
```

- [ ] **Step 2: Write `src/components/Hero.astro`**

```astro
---
import HeroIllustration from './illustrations/HeroIllustration.astro';

interface Props {
  headline: string;
  sub: string;
}
const { headline, sub } = Astro.props;
---
<section class="hero" id="top">
  <div class="container grid">
    <div class="copy">
      <h1>{headline}</h1>
      <p class="sub">{sub}</p>
    </div>
    <HeroIllustration />
  </div>
</section>

<style>
  .hero {
    padding-block: clamp(64px, 10vw, 140px);
    background:
      radial-gradient(ellipse at top right, rgba(236, 72, 153, 0.08), transparent 60%),
      radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.08), transparent 60%);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  h1 {
    background: var(--gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .sub {
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
    color: var(--text-muted);
    margin-top: 20px;
    max-width: 52ch;
  }
  @media (max-width: 1024px) {
    .grid { grid-template-columns: 1fr; gap: 40px; }
  }
</style>
```

- [ ] **Step 3: Write `src/pages/it/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Hero from '../../components/Hero.astro';
---
<BaseLayout
  title="CoGe · Cost Governance"
  description="CoGe unifica cost allocation, budget, timesheet e analytics per business unit che vogliono sapere dove va ogni euro."
  lang="it"
>
  <Header lang="it" />
  <main>
    <Hero
      headline="Governa costi e risorse. In un posto solo."
      sub="CoGe è la piattaforma che unifica cost allocation, budget, timesheet e analytics per business unit che vogliono sapere davvero dove va ogni euro."
    />
  </main>
  <Footer lang="it" />
</BaseLayout>
```

- [ ] **Step 4: Write `src/pages/en/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Hero from '../../components/Hero.astro';
---
<BaseLayout
  title="CoGe · Cost Governance"
  description="CoGe unifies cost allocation, budgets, timesheets and analytics for business units that want to know where every euro goes."
  lang="en"
>
  <Header lang="en" />
  <main>
    <Hero
      headline="Cost and resource governance. One place."
      sub="CoGe unifies cost allocation, budgets, timesheets and analytics for business units that want to know exactly where every euro goes."
    />
  </main>
  <Footer lang="en" />
</BaseLayout>
```

- [ ] **Step 5: Run dev server, verify visually**

Run: `npm run dev`
Browse: `http://localhost:4321/coge-showcase/it/` and `/en/`.

Expected checklist:
- Gradient hero headline renders
- Sub-copy visible in the target language
- SVG illustration renders (no broken image)
- Header sticky, language toggle active on current locale
- Footer renders with copyright year + links
- Clicking toggle switches URL (and writes to localStorage — verify in devtools Application → Local Storage)

Stop the dev server with Ctrl+C.

- [ ] **Step 6: Verify build + astro check**

Run: `npm run build && npm run check`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero.astro src/components/illustrations/HeroIllustration.astro src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(pages): add Hero section with gradient headline + SVG illustration"
```

---

## Task 11: ChapterDivider + Chapter 01 (Problem) + ProblemIllustration

**Files:**
- Create: `src/components/ChapterDivider.astro`
- Create: `src/components/illustrations/ProblemIllustration.astro`
- Modify: `src/pages/it/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/ChapterDivider.astro`**

```astro
---
interface Props {
  label: string;
  number: string;
  title: string;
}
const { label, number, title } = Astro.props;
---
<div class="divider">
  <div class="rule" aria-hidden="true"></div>
  <p class="chapter-label">{label} {number}</p>
  <h2>{title}</h2>
</div>

<style>
  .divider {
    text-align: center;
    margin-block-end: 48px;
  }
  .rule {
    height: 2px;
    width: 60px;
    margin-inline: auto;
    margin-block-end: 20px;
    background: var(--gradient);
    border-radius: 2px;
  }
  h2 { margin-top: 8px; }
</style>
```

- [ ] **Step 2: Write `src/components/illustrations/ProblemIllustration.astro`**

```astro
---
---
<div class="problem-illu" aria-hidden="true">
  <svg viewBox="0 0 500 320" xmlns="http://www.w3.org/2000/svg">
    <g fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5">
      <rect x="20"  y="30"  width="140" height="90" rx="6" transform="rotate(-6 90 75)"/>
      <rect x="180" y="20"  width="140" height="90" rx="6" transform="rotate(3 250 65)"/>
      <rect x="340" y="40"  width="140" height="90" rx="6" transform="rotate(-4 410 85)"/>
      <rect x="60"  y="160" width="140" height="90" rx="6" transform="rotate(5 130 205)"/>
      <rect x="230" y="180" width="140" height="90" rx="6" transform="rotate(-3 300 225)"/>
      <rect x="380" y="190" width="100" height="80" rx="6" transform="rotate(4 430 230)"/>
    </g>
    <g fill="#e2e8f0">
      <rect x="30"  y="40"  width="90"  height="6" rx="3" transform="rotate(-6 90 75)"/>
      <rect x="190" y="30"  width="90"  height="6" rx="3" transform="rotate(3 250 65)"/>
      <rect x="350" y="50"  width="90"  height="6" rx="3" transform="rotate(-4 410 85)"/>
      <rect x="70"  y="170" width="90"  height="6" rx="3" transform="rotate(5 130 205)"/>
      <rect x="240" y="190" width="90"  height="6" rx="3" transform="rotate(-3 300 225)"/>
      <rect x="390" y="200" width="60"  height="6" rx="3" transform="rotate(4 430 230)"/>
    </g>
  </svg>
</div>

<style>
  .problem-illu {
    max-width: 500px;
    margin-inline: auto;
    margin-block-start: 48px;
    opacity: 0.9;
  }
  .problem-illu svg { width: 100%; height: auto; display: block; }
</style>
```

- [ ] **Step 3: Add Chapter 01 block to `src/pages/it/index.astro`**

Insert inside `<main>` after `<Hero … />`:

```astro
    <section id="problem" class="chapter">
      <div class="container">
        <ChapterDivider label="Capitolo" number="01" title="Il Problema" />
        <p class="narrative">
          Excel sparsi, timesheet in ritardo, budget che nessuno riconcilia. I costi reali si scoprono
          a consuntivo, quando è tardi. <strong>CoGe sposta la verità dei numeri dal Q+1 al giorno 1.</strong>
        </p>
        <ProblemIllustration />
      </div>
    </section>
```

And add imports at top:

```astro
import ChapterDivider from '../../components/ChapterDivider.astro';
import ProblemIllustration from '../../components/illustrations/ProblemIllustration.astro';
```

- [ ] **Step 4: Add Chapter 01 block to `src/pages/en/index.astro`**

Same structure, EN copy:

```astro
    <section id="problem" class="chapter">
      <div class="container">
        <ChapterDivider label="Chapter" number="01" title="The Problem" />
        <p class="narrative">
          Scattered spreadsheets, late timesheets, budgets no one reconciles. Real costs surface at
          quarter-end, when it's too late. <strong>CoGe moves the truth of the numbers from Q+1 to day one.</strong>
        </p>
        <ProblemIllustration />
      </div>
    </section>
```

Plus the same imports.

- [ ] **Step 5: Add shared `.narrative` style**

Append to `src/styles/global.css`:

```css
.narrative {
  font-size: clamp(1.1rem, 1.4vw, 1.35rem);
  color: var(--text);
  max-width: 62ch;
  margin-inline: auto;
  text-align: center;
  line-height: 1.55;
}
.narrative strong { color: var(--primary-600); font-weight: 600; }
```

- [ ] **Step 6: Verify in dev server**

Run: `npm run dev`
Browse both locales. Verify Chapter 01 renders with divider, centered narrative, and illustration. Stop server.

- [ ] **Step 7: Build + commit**

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/components/ChapterDivider.astro src/components/illustrations/ProblemIllustration.astro src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add ChapterDivider, Chapter 01 Problem with illustration"
```

---

## Task 12: Chapter 02 — Four pillars

**Files:**
- Create: `src/components/PillarCard.astro`
- Modify: `src/pages/it/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/PillarCard.astro`**

```astro
---
interface Props {
  icon: string;
  title: string;
  body: string;
}
const { icon, title, body } = Astro.props;
---
<article class="pillar">
  <div class="icon" aria-hidden="true">{icon}</div>
  <h3>{title}</h3>
  <p>{body}</p>
</article>

<style>
  .pillar {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .pillar:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px -16px rgba(99, 102, 241, 0.25);
  }
  .icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--hover-tint);
    font-size: 24px;
    margin-bottom: 20px;
  }
  h3 { margin: 0 0 10px; }
  p { margin: 0; color: var(--text-muted); font-size: 15px; }
</style>
```

- [ ] **Step 2: Add Chapter 02 block to `src/pages/it/index.astro`**

Add import:

```astro
import PillarCard from '../../components/PillarCard.astro';
```

Insert after Chapter 01 `<section>`:

```astro
    <section id="pillars" class="chapter">
      <div class="container">
        <ChapterDivider label="Capitolo" number="02" title="Cosa Fa CoGe" />
        <div class="pillars-grid">
          <PillarCard icon="💶" title="Cost Allocation" body="Tracking per progetto, cliente, business unit, con ciclo di vita draft → published." />
          <PillarCard icon="📈" title="Budget & Forecast" body="Pianificazione ricavi e costi con scostamento su consuntivo." />
          <PillarCard icon="🧭" title="Resource Planning" body="Carico di lavoro, produttività, matrice skill." />
          <PillarCard icon="📊" title="Analytics" body="Dashboard read-only su dati live." />
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Add Chapter 02 block to `src/pages/en/index.astro`**

Same import. Block:

```astro
    <section id="pillars" class="chapter">
      <div class="container">
        <ChapterDivider label="Chapter" number="02" title="What CoGe Does" />
        <div class="pillars-grid">
          <PillarCard icon="💶" title="Cost Allocation" body="Tracking per project, customer, unit, with a draft → published lifecycle." />
          <PillarCard icon="📈" title="Budget & Forecast" body="Revenue vs. cost planning with variance against actuals." />
          <PillarCard icon="🧭" title="Resource Planning" body="Workload, productivity, skills matrix." />
          <PillarCard icon="📊" title="Analytics" body="Read-only dashboards over live data." />
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Add grid style**

Append to `src/styles/global.css`:

```css
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 48px;
}
@media (max-width: 1024px) { .pillars-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .pillars-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Verify + commit**

Run: `npm run dev` → browse both locales → verify 4 pillar cards render in a grid with hover lift. Stop server.

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/components/PillarCard.astro src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add Chapter 02 four pillars with hover-lift cards"
```

---

## Task 13: Content collections config

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const features = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    order: z.number().int().positive(),
    title_it: z.string(),
    title_en: z.string(),
    body_it: z.string(),
    body_en: z.string(),
    screenshot: z.string(),
    icon: z.string(),
  }),
});

const milestones = defineCollection({
  type: 'content',
  schema: z.object({
    version: z.string(),
    date: z.string(),
    title_it: z.string(),
    title_en: z.string(),
    blurb_it: z.string(),
    blurb_en: z.string(),
  }),
});

export const collections = { features, milestones };
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0 (empty collections still valid).

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): define Zod schemas for features + milestones collections"
```

---

## Task 14: Feature collection entries (10 items)

Each feature MDX file holds metadata in frontmatter plus an empty body. Bilingual fields in frontmatter per spec schema.

**Files (create all):**
- `src/content/features/01-cac-lifecycle.mdx`
- `src/content/features/02-budget-variance.mdx`
- `src/content/features/03-timesheet-excel.mdx`
- `src/content/features/04-resource-workload.mdx`
- `src/content/features/05-productivity.mdx`
- `src/content/features/06-skills-matrix.mdx`
- `src/content/features/07-data-quality.mdx`
- `src/content/features/08-financials.mdx`
- `src/content/features/09-business-settings.mdx`
- `src/content/features/10-role-admin.mdx`

- [ ] **Step 1: Write `01-cac-lifecycle.mdx`**

```mdx
---
id: cac-lifecycle
order: 1
title_it: Ciclo di vita del CAC
title_en: CAC lifecycle
body_it: Wizard per creare Cost Allocation Code a partire da progetti fixed-price o T&M. Stato draft → published con baseline revisionabili.
body_en: Wizard to create a Cost Allocation Code for fixed-price or T&M projects. Draft → published lifecycle with revisable baselines.
screenshot: feature-cac-lifecycle
icon: 📝
---
```

- [ ] **Step 2: Write `02-budget-variance.mdx`**

```mdx
---
id: budget-variance
order: 2
title_it: Budget e scostamento
title_en: Budget & variance
body_it: Pianifica ricavi e costi annuali, confronta con consuntivo e leggi lo scostamento mese per mese sulla dashboard.
body_en: Plan annual revenue and cost, compare to actuals, read the month-by-month variance on the dashboard.
screenshot: feature-budget-variance
icon: 📊
---
```

- [ ] **Step 3: Write `03-timesheet-excel.mdx`**

```mdx
---
id: timesheet-excel
order: 3
title_it: Timesheet e import Excel
title_en: Timesheets + Excel import
body_it: Registra le ore per utente e CAC. Import Excel con validazioni, rilevamento duplicati e riallineamento automatico delle righe TBD.
body_en: Log hours per user and CAC. Excel import with validation, duplicate detection, automatic TBD row realignment.
screenshot: feature-timesheet-excel
icon: ⏱️
---
```

- [ ] **Step 4: Write `04-resource-workload.mdx`**

```mdx
---
id: resource-workload
order: 4
title_it: Carico risorse
title_en: Resource workload
body_it: Visualizza carico e disponibilità per persona e unità. Evidenzia sovra- e sottoallocazioni prima che diventino problemi.
body_en: Workload and availability per person and unit. Surfaces over- and under-allocation before it becomes a problem.
screenshot: feature-resource-workload
icon: 🧭
---
```

- [ ] **Step 5: Write `05-productivity.mdx`**

```mdx
---
id: productivity
order: 5
title_it: Analytics di produttività
title_en: Productivity analytics
body_it: Indicatori di produttività per utente, team e unità, calcolati sulle ore registrate e sul venduto dei CAC.
body_en: Productivity indicators per user, team, and unit, computed from logged hours and CAC sold value.
screenshot: feature-productivity
icon: 📈
---
```

- [ ] **Step 6: Write `06-skills-matrix.mdx`**

```mdx
---
id: skills-matrix
order: 6
title_it: Matrice skill
title_en: Skills matrix
body_it: Mappa skill per persona con livelli e ricerca inversa "chi sa fare cosa" — utile per allocazioni e staffing.
body_en: Per-person skills map with levels and reverse search "who can do what" — handy for staffing decisions.
screenshot: feature-skills-matrix
icon: 🧩
---
```

- [ ] **Step 7: Write `07-data-quality.mdx`**

```mdx
---
id: data-quality
order: 7
title_it: Data quality alerts
title_en: Data quality alerts
body_it: Controlli automatici su timesheet, CAC e baseline. Segnala incongruenze prima che inquinino il consuntivo.
body_en: Automatic checks on timesheets, CACs, and baselines. Flags inconsistencies before they pollute the close.
screenshot: feature-data-quality
icon: 🛡️
---
```

- [ ] **Step 8: Write `08-financials.mdx`**

```mdx
---
id: financials
order: 8
title_it: Financials
title_en: Financials
body_it: Confronto actual vs. budget con drill-down per CAC, cliente, unità e competenza temporale.
body_en: Actual vs. budget with drill-down by CAC, customer, unit, and accounting period.
screenshot: feature-financials
icon: 💶
---
```

- [ ] **Step 9: Write `09-business-settings.mdx`**

```mdx
---
id: business-settings
order: 9
title_it: Business settings
title_en: Business settings
body_it: Parametri di business (costi standard, listini, calendari) modificabili senza passare dal codice.
body_en: Business parameters (standard costs, rate cards, calendars) editable without going through code.
screenshot: feature-business-settings
icon: ⚙️
---
```

- [ ] **Step 10: Write `10-role-admin.mdx`**

```mdx
---
id: role-admin
order: 10
title_it: Admin con ruoli
title_en: Role-based admin
body_it: Pannello amministrativo Filament con permessi per ruolo. Ogni utente vede solo ciò che compete alla sua unità.
body_en: Filament admin panel with role-based permissions. Users see only what their unit owns.
screenshot: feature-role-admin
icon: 🔐
---
```

- [ ] **Step 11: Verify build**

Run: `npm run build`
Expected: exit 0, no Zod validation errors.

- [ ] **Step 12: Commit**

```bash
git add src/content/features/
git commit -m "feat(content): add 10 feature entries with bilingual copy + screenshot refs"
```

---

## Task 15: FeatureCard + Chapter 03 render

**Files:**
- Create: `src/components/FeatureCard.astro`
- Modify: `src/pages/it/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/FeatureCard.astro`**

```astro
---
import type { Lang } from '../i18n';

interface Props {
  lang: Lang;
  icon: string;
  titleIt: string;
  titleEn: string;
  bodyIt: string;
  bodyEn: string;
  screenshot: string;
}
const { lang, icon, titleIt, titleEn, bodyIt, bodyEn, screenshot } = Astro.props;
const title = lang === 'it' ? titleIt : titleEn;
const body = lang === 'it' ? bodyIt : bodyEn;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const avif = `${base}/screenshots/${screenshot}.avif`;
const webp = `${base}/screenshots/${screenshot}.webp`;
const alt = title;
---
<article class="feature-card">
  <picture>
    <source srcset={avif} type="image/avif" />
    <source srcset={webp} type="image/webp" />
    <img src={webp} alt={alt} loading="lazy" decoding="async" width="1440" height="900" />
  </picture>
  <div class="meta">
    <div class="icon" aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
    <p>{body}</p>
  </div>
</article>

<style>
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -20px rgba(99, 102, 241, 0.3);
  }
  picture { display: block; background: var(--hover-tint); }
  img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
  .meta { padding: 20px 24px 24px; }
  .icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--hover-tint);
    display: grid;
    place-items: center;
    margin-bottom: 12px;
    font-size: 18px;
  }
  h3 { margin: 0 0 8px; font-size: 1.1rem; }
  p { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.55; }
</style>
```

- [ ] **Step 2: Add Chapter 03 to `src/pages/it/index.astro`**

Imports:

```astro
import { getCollection } from 'astro:content';
import FeatureCard from '../../components/FeatureCard.astro';

const features = (await getCollection('features')).sort((a, b) => a.data.order - b.data.order);
```

Insert after Chapter 02:

```astro
    <section id="features" class="chapter">
      <div class="container">
        <ChapterDivider label="Capitolo" number="03" title="Feature Tour" />
        <div class="features-grid">
          {features.map((f) => (
            <FeatureCard
              lang="it"
              icon={f.data.icon}
              titleIt={f.data.title_it}
              titleEn={f.data.title_en}
              bodyIt={f.data.body_it}
              bodyEn={f.data.body_en}
              screenshot={f.data.screenshot}
            />
          ))}
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Add Chapter 03 to `src/pages/en/index.astro`**

Same imports, mirror section with `lang="en"` on cards and English divider labels:

```astro
    <section id="features" class="chapter">
      <div class="container">
        <ChapterDivider label="Chapter" number="03" title="Feature Tour" />
        <div class="features-grid">
          {features.map((f) => (
            <FeatureCard
              lang="en"
              icon={f.data.icon}
              titleIt={f.data.title_it}
              titleEn={f.data.title_en}
              bodyIt={f.data.body_it}
              bodyEn={f.data.body_en}
              screenshot={f.data.screenshot}
            />
          ))}
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Add grid style**

Append to `src/styles/global.css`:

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 48px;
}
@media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .features-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Verify**

Run: `npm run dev`
Expected: 10 feature cards render per locale. Screenshots show broken-image placeholders (real files added in Task 21). Card text is in the target language. Hover lift works. Stop server.

Run: `npm run build && npm run check`
Expected: exit 0. (Images 404 is acceptable at build time — Astro won't fail on missing public assets.)

- [ ] **Step 6: Commit**

```bash
git add src/components/FeatureCard.astro src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add Chapter 03 Feature Tour driven by content collection"
```

---

## Task 16: Chapter 04 — Under the Hood

**Files:**
- Create: `src/components/TechCard.astro`
- Create: `src/components/illustrations/ArchitectureDiagram.astro`
- Modify: `src/pages/it/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/components/TechCard.astro`**

```astro
---
interface Props {
  name: string;
  version: string;
  role: string;
}
const { name, version, role } = Astro.props;
---
<div class="tech-card">
  <p class="name">{name}</p>
  <p class="version mono">{version}</p>
  <p class="role">{role}</p>
</div>

<style>
  .tech-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
  }
  .name { margin: 0; font-weight: 700; font-size: 15px; }
  .version { margin: 4px 0 10px; color: var(--primary-600); font-size: 13px; }
  .role { margin: 0; color: var(--text-muted); font-size: 13px; }
</style>
```

- [ ] **Step 2: Write `src/components/illustrations/ArchitectureDiagram.astro`**

```astro
---
interface Props {
  lang: 'it' | 'en';
}
const { lang } = Astro.props;
const labels = {
  it: { dashboard: 'Dashboard Blade (read-only)', admin: 'Admin Filament', db: 'MongoDB 8', queue: 'Redis queue' },
  en: { dashboard: 'Blade dashboard (read-only)', admin: 'Filament admin', db: 'MongoDB 8', queue: 'Redis queue' },
}[lang];
---
<figure class="arch">
  <svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${labels.dashboard}, ${labels.admin}, ${labels.db}`}>
    <defs>
      <linearGradient id="ag" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6366f1"/>
        <stop offset="1" stop-color="#ec4899"/>
      </linearGradient>
    </defs>

    <g fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5">
      <rect x="40"  y="40"  width="260" height="90" rx="10"/>
      <rect x="400" y="40"  width="260" height="90" rx="10"/>
      <rect x="180" y="220" width="340" height="90" rx="10"/>
    </g>

    <text x="170" y="80"  text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#0f172a">{labels.dashboard}</text>
    <text x="170" y="104" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#475569">Laravel 12 · Blade</text>

    <text x="530" y="80"  text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#0f172a">{labels.admin}</text>
    <text x="530" y="104" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#475569">Filament 3</text>

    <text x="350" y="260" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#0f172a">{labels.db}</text>
    <text x="350" y="284" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#475569">{labels.queue}</text>

    <path d="M170 130 L290 220" stroke="url(#ag)" stroke-width="2" fill="none"/>
    <path d="M530 130 L410 220" stroke="url(#ag)" stroke-width="2" fill="none"/>
  </svg>
</figure>

<style>
  .arch { margin: 0; padding: 0; max-width: 720px; margin-inline: auto; margin-top: 48px; }
  .arch svg { width: 100%; height: auto; display: block; }
</style>
```

- [ ] **Step 3: Add Chapter 04 block to `src/pages/it/index.astro`**

Imports:

```astro
import TechCard from '../../components/TechCard.astro';
import ArchitectureDiagram from '../../components/illustrations/ArchitectureDiagram.astro';
```

Block:

```astro
    <section id="tech" class="chapter tech-bg">
      <div class="container">
        <ChapterDivider label="Capitolo" number="04" title="Sotto il Cofano" />
        <div class="tech-grid">
          <TechCard name="Laravel" version="12" role="Framework applicativo" />
          <TechCard name="Filament" version="3" role="Admin panel" />
          <TechCard name="MongoDB" version="8" role="Database documentale" />
          <TechCard name="PHP" version="8.5" role="Runtime" />
          <TechCard name="Docker Compose" version="—" role="Sviluppo locale e deploy" />
          <TechCard name="Redis" version="—" role="Queue & cache" />
        </div>
        <ArchitectureDiagram lang="it" />
        <p class="narrative small">
          Due layer sopra lo stesso MongoDB: una dashboard Blade read-only per la lettura, un admin
          Filament per la scrittura. Coda Redis per import e job pesanti.
        </p>
      </div>
    </section>
```

- [ ] **Step 4: Add Chapter 04 block to `src/pages/en/index.astro`**

Same imports. Block:

```astro
    <section id="tech" class="chapter tech-bg">
      <div class="container">
        <ChapterDivider label="Chapter" number="04" title="Under the Hood" />
        <div class="tech-grid">
          <TechCard name="Laravel" version="12" role="Application framework" />
          <TechCard name="Filament" version="3" role="Admin panel" />
          <TechCard name="MongoDB" version="8" role="Document database" />
          <TechCard name="PHP" version="8.5" role="Runtime" />
          <TechCard name="Docker Compose" version="—" role="Local dev + deploy" />
          <TechCard name="Redis" version="—" role="Queue & cache" />
        </div>
        <ArchitectureDiagram lang="en" />
        <p class="narrative small">
          Two layers over the same MongoDB: a read-only Blade dashboard for consumption, a Filament
          admin for writes. Redis queue for imports and heavy jobs.
        </p>
      </div>
    </section>
```

- [ ] **Step 5: Styles**

Append to `src/styles/global.css`:

```css
.tech-bg {
  background:
    radial-gradient(ellipse at bottom, rgba(99, 102, 241, 0.06), transparent 60%),
    var(--surface);
  border-block: 1px solid var(--border);
}
.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;
}
@media (max-width: 1024px) { .tech-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .tech-grid { grid-template-columns: 1fr; } }

.narrative.small { font-size: 1rem; margin-top: 32px; }
```

- [ ] **Step 6: Verify + commit**

Run: `npm run dev` → verify tech cards, architecture diagram, narrative in both locales. Stop server.

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/components/TechCard.astro src/components/illustrations/ArchitectureDiagram.astro src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add Chapter 04 Under the Hood with tech grid + architecture diagram"
```

---

## Task 17: Milestone entries + TimelineItem + Chapter 05

Cherry-pick ~10 versions from `coge/CHANGELOG.md` covering a spread (old → recent). Use the ones listed below; each gets its own MDX file.

**Files:**
- `src/content/milestones/v3.01.mdx` through `v3.17.mdx` (10 files)
- `src/components/TimelineItem.astro`

- [ ] **Step 1: Create 10 milestone MDX files under `src/content/milestones/`**

Write `v3.05.mdx`:

```mdx
---
version: "3.5.0"
date: "2025-09-10"
title_it: "Timesheet Excel import"
title_en: "Timesheet Excel import"
blurb_it: "Import delle ore da Excel con validazioni, rilevamento duplicati e riallineamento righe TBD."
blurb_en: "Excel hours import with validation, duplicate detection, TBD row realignment."
---
```

Write `v3.08.mdx`:

```mdx
---
version: "3.8.0"
date: "2025-11-02"
title_it: "Resource workload"
title_en: "Resource workload"
blurb_it: "Nuova vista carico e disponibilità per persona e unità, con evidenza su sovra- e sottoallocazioni."
blurb_en: "New workload and availability view per person and unit, with over-/under-allocation highlights."
---
```

Write `v3.10.mdx`:

```mdx
---
version: "3.10.0"
date: "2025-12-15"
title_it: "Productivity analytics"
title_en: "Productivity analytics"
blurb_it: "Indicatori di produttività per utente, team e unità dalle ore e dal venduto CAC."
blurb_en: "Productivity indicators per user, team, and unit from hours and CAC sold value."
---
```

Write `v3.12.mdx`:

```mdx
---
version: "3.12.0"
date: "2026-01-20"
title_it: "Skills matrix"
title_en: "Skills matrix"
blurb_it: "Matrice skill per persona con livelli e ricerca inversa."
blurb_en: "Per-person skills matrix with levels and reverse search."
---
```

Write `v3.13.mdx`:

```mdx
---
version: "3.13.0"
date: "2026-02-03"
title_it: "Financials"
title_en: "Financials"
blurb_it: "Confronto actual vs. budget con drill-down per CAC, cliente, unità."
blurb_en: "Actual vs. budget with drill-down by CAC, customer, unit."
---
```

Write `v3.14.mdx`:

```mdx
---
version: "3.14.0"
date: "2026-02-18"
title_it: "Business settings"
title_en: "Business settings"
blurb_it: "Parametri di business editabili da admin senza toccare il codice."
blurb_en: "Business parameters editable from admin without code changes."
---
```

Write `v3.15.mdx`:

```mdx
---
version: "3.15.0"
date: "2026-03-05"
title_it: "Audit logging"
title_en: "Audit logging"
blurb_it: "Audit log completo sulle scritture amministrative."
blurb_en: "Full audit log on administrative writes."
---
```

Write `v3.16.mdx`:

```mdx
---
version: "3.16.0"
date: "2026-03-25"
title_it: "Baseline editor"
title_en: "Baseline editor"
blurb_it: "Editor visuale della baseline costi con margine commerciale configurabile e revisioni storiche."
blurb_en: "Visual cost-baseline editor with configurable commercial margin and historical revisions."
---
```

Write `v3.17.mdx`:

```mdx
---
version: "3.17.0"
date: "2026-04-17"
title_it: "Baseline revision export"
title_en: "Baseline revision export"
blurb_it: "Export XLSX delle revisioni di baseline con snapshot del prezzo target e margine arrotondato."
blurb_en: "XLSX export of baseline revisions with target-price snapshot and rounded margin."
---
```

Write `v3.18.mdx`:

```mdx
---
version: "3.18.0"
date: "2026-04-20"
title_it: "Data quality alerts"
title_en: "Data quality alerts"
blurb_it: "Controlli automatici su timesheet, CAC e baseline con segnalazione precoce delle incongruenze."
blurb_en: "Automatic checks on timesheets, CACs, and baselines with early warning on inconsistencies."
---
```

- [ ] **Step 2: Write `src/components/TimelineItem.astro`**

```astro
---
interface Props {
  version: string;
  date: string;
  title: string;
  blurb: string;
}
const { version, date, title, blurb } = Astro.props;
---
<li class="timeline-item">
  <div class="pip" aria-hidden="true"></div>
  <div class="meta">
    <p class="tag mono">v{version} · {date}</p>
    <h3>{title}</h3>
    <p class="blurb">{blurb}</p>
  </div>
</li>

<style>
  .timeline-item {
    position: relative;
    padding-left: 48px;
    padding-block: 20px;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 32px;
    bottom: -20px;
    width: 2px;
    background: var(--border);
  }
  .timeline-item:last-child::before { display: none; }
  .pip {
    position: absolute;
    left: 8px;
    top: 24px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--gradient);
    box-shadow: 0 0 0 4px var(--bg);
  }
  .tag {
    margin: 0 0 4px;
    color: var(--primary-600);
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  h3 { margin: 0 0 6px; font-size: 1.05rem; }
  .blurb { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.55; }
</style>
```

- [ ] **Step 3: Add Chapter 05 block to `src/pages/it/index.astro`**

Imports:

```astro
import TimelineItem from '../../components/TimelineItem.astro';
const milestones = (await getCollection('milestones')).sort((a, b) => a.data.date.localeCompare(b.data.date));
```

Block:

```astro
    <section id="evolution" class="chapter">
      <div class="container narrow">
        <ChapterDivider label="Capitolo" number="05" title="Evoluzione" />
        <ol class="timeline" role="list">
          {milestones.map((m) => (
            <TimelineItem
              version={m.data.version}
              date={m.data.date}
              title={m.data.title_it}
              blurb={m.data.blurb_it}
            />
          ))}
        </ol>
      </div>
    </section>
```

- [ ] **Step 4: Add Chapter 05 block to `src/pages/en/index.astro`**

Same imports, English:

```astro
    <section id="evolution" class="chapter">
      <div class="container narrow">
        <ChapterDivider label="Chapter" number="05" title="Evolution" />
        <ol class="timeline" role="list">
          {milestones.map((m) => (
            <TimelineItem
              version={m.data.version}
              date={m.data.date}
              title={m.data.title_en}
              blurb={m.data.blurb_en}
            />
          ))}
        </ol>
      </div>
    </section>
```

- [ ] **Step 5: Styles**

Append to `src/styles/global.css`:

```css
.container.narrow {
  max-width: 780px;
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 40px);
}
.timeline {
  list-style: none;
  margin: 48px 0 0;
  padding: 0;
}
```

- [ ] **Step 6: Verify + commit**

Run: `npm run dev` → timeline renders with 10 entries, vertical rule + pips. Stop server.

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/content/milestones/ src/components/TimelineItem.astro src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add Chapter 05 Evolution timeline from milestone collection"
```

---

## Task 18: Chapter 06 — Who It's For

**Files:**
- Modify: `src/pages/it/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Add Chapter 06 block to `src/pages/it/index.astro`**

```astro
    <section id="audience" class="chapter audience-bg">
      <div class="container narrow">
        <ChapterDivider label="Capitolo" number="06" title="Per Chi è CoGe" />
        <p class="narrative">
          Società di servizi multi-unit, da <strong>20 a 500 persone</strong>, con progetti T&amp;M e
          fixed-price mischiati. Team finance e delivery che oggi ricuciono il quadro tra Excel sparsi e
          BI a macchia di leopardo. CoGe sostituisce quella frammentazione con un'unica fonte di verità.
        </p>
      </div>
    </section>
```

- [ ] **Step 2: Add Chapter 06 block to `src/pages/en/index.astro`**

```astro
    <section id="audience" class="chapter audience-bg">
      <div class="container narrow">
        <ChapterDivider label="Chapter" number="06" title="Who It's For" />
        <p class="narrative">
          Multi-unit service companies, <strong>20 to 500 people</strong>, running mixed T&amp;M and
          fixed-price portfolios. Finance and delivery teams currently stitching the picture together
          across scattered spreadsheets and patchy BI. CoGe replaces that fragmentation with a single
          source of truth.
        </p>
      </div>
    </section>
```

- [ ] **Step 3: Styles**

Append to `src/styles/global.css`:

```css
.audience-bg {
  background:
    radial-gradient(ellipse at top, rgba(236, 72, 153, 0.06), transparent 60%),
    var(--bg);
}
```

- [ ] **Step 4: Verify + commit**

Run: `npm run dev` → Chapter 06 renders as closing narrative. Stop server.

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/styles/global.css src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(chapters): add Chapter 06 Who It's For closing narrative"
```

---

## Task 19: Scroll reveal + reduced-motion

**Files:**
- Create: `src/components/ScrollReveal.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `src/components/ScrollReveal.astro`**

Global client script + CSS injection used once from BaseLayout:

```astro
---
---
<script is:inline>
  (function () {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('[data-reveal]');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  })();
</script>

<style is:global>
  [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    will-change: opacity, transform;
  }
  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-reveal] { opacity: 1; transform: none; transition: none; }
  }
</style>
```

- [ ] **Step 2: Include ScrollReveal in `BaseLayout.astro`**

Edit `src/layouts/BaseLayout.astro`:

Add import:

```astro
import ScrollReveal from '../components/ScrollReveal.astro';
```

Add `<ScrollReveal />` as the last child of `<body>`, after `<slot />`:

```astro
  <body>
    <slot />
    <ScrollReveal />
  </body>
```

- [ ] **Step 3: Decorate every `<section class="chapter">` with `data-reveal`**

Edit `src/pages/it/index.astro` and `src/pages/en/index.astro`: add `data-reveal` to each `<section id="problem">`, `#pillars`, `#features`, `#tech`, `#evolution`, `#audience`.

Example:

```astro
<section id="problem" class="chapter" data-reveal>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` → scroll slowly, verify each section fades/translates in once.

Then in devtools: toggle reduced motion (Rendering panel → "prefers-reduced-motion: reduce"), reload, confirm sections are visible immediately without animation.

Stop server.

- [ ] **Step 5: Build + commit**

Run: `npm run build && npm run check`
Expected: exit 0.

```bash
git add src/components/ScrollReveal.astro src/layouts/BaseLayout.astro src/pages/it/index.astro src/pages/en/index.astro
git commit -m "feat(motion): scroll-reveal sections with prefers-reduced-motion guard"
```

---

## Task 20: Custom bilingual 404

**Files:**
- Create: `public/404.html`

- [ ] **Step 1: Write `public/404.html`**

```html
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 · CoGe Cost Governance</title>
    <meta name="robots" content="noindex" />
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fafafa;
        color: #0f172a;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        padding: 40px;
      }
      .card {
        text-align: center;
        max-width: 520px;
      }
      .badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 999px;
        background: linear-gradient(135deg, #6366f1, #ec4899);
        color: #ffffff;
        font-size: 12px;
        letter-spacing: 1.5px;
        font-weight: 700;
        margin-bottom: 24px;
      }
      h1 { font-size: clamp(1.75rem, 3vw, 2.5rem); margin: 0 0 12px; }
      p { margin: 6px 0 0; color: #475569; line-height: 1.6; }
      .sep { margin: 24px 0; height: 1px; background: #e2e8f0; }
      a.btn {
        display: inline-block;
        margin: 8px 6px 0;
        padding: 10px 18px;
        border-radius: 8px;
        background: #6366f1;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
      }
      a.btn.alt { background: transparent; color: #6366f1; border: 1px solid #6366f1; }
      a.btn:hover { filter: brightness(1.05); }
    </style>
  </head>
  <body>
    <main class="card">
      <span class="badge">404</span>
      <h1>Pagina non trovata</h1>
      <p>La pagina che cercavi non esiste o è stata spostata.</p>
      <div class="sep"></div>
      <h1 style="font-size: 1.5rem;">Page not found</h1>
      <p>The page you were looking for doesn't exist or has moved.</p>
      <p style="margin-top: 28px;">
        <a class="btn" href="/coge-showcase/it/">Torna alla home</a>
        <a class="btn alt" href="/coge-showcase/en/">Back to home</a>
      </p>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Verify build copies it**

Run: `npm run build`
Then check `dist/404.html` exists.

- [ ] **Step 3: Commit**

```bash
git add public/404.html
git commit -m "feat(404): add bilingual static 404 page"
```

---

## Task 21: Screenshot capture docs + placeholder assets

**Files:**
- Create: `docs/screenshots-capture.md`
- Create: 10 placeholder `public/screenshots/feature-<id>.webp` files (1 × 1 transparent PNG renamed until real capture)

- [ ] **Step 1: Write `docs/screenshots-capture.md`**

```markdown
# Screenshot capture procedure

All feature-tour screenshots come from a locally-running CoGe instance with seeded realistic data.
PII (real names, emails, customer identifiers) must be blurred before commit.

## Prerequisites

- Clone `giuseppeoncia/coge` alongside this repo.
- Docker Desktop running.
- Image tooling for AVIF/WebP conversion (`cwebp`, `avifenc`, or the `sharp-cli` npm package).

## Boot CoGe

```bash
cd ~/projects/giuseppeoncia/coge
docker compose up -d
docker compose exec app php artisan migrate --seed
```

Open `http://localhost:8000/admin`, log in with the seeded admin user (see `coge/README.md`).

## Capture

1. Use a Chrome window sized exactly to 1440 × 900 (DevTools → Device toolbar → "Responsive" → 1440 × 900).
2. Disable browser extensions that add UI chrome.
3. For each entry below, navigate to the URL, wait for the page to settle, capture a full-viewport PNG.
4. Blur any PII (names, emails, real customer identifiers) with a soft blur (`Radius: 10px`). Prefer seed data that needs no blurring.
5. Export the PNG to AVIF (quality 80) and WebP (quality 85).
6. Commit to `public/screenshots/` as `feature-<id>.avif` and `feature-<id>.webp`.

## Feature list

| ID                | Route                             |
|-------------------|-----------------------------------|
| cac-lifecycle     | `/admin/cost-allocation-codes`    |
| budget-variance   | `/admin/budget-variance`          |
| timesheet-excel   | `/admin/timesheet-import`         |
| resource-workload | `/admin/workload`                 |
| productivity      | `/admin/productivity`             |
| skills-matrix     | `/admin/skills-matrix`            |
| data-quality      | `/admin/data-quality`             |
| financials        | `/admin/financials`               |
| business-settings | `/admin/business-settings`        |
| role-admin        | `/admin/users`                    |

Adjust routes if CoGe has renamed them; the naming convention is `feature-<id>.{avif,webp}`.

## Automation hint

`sharp` one-liner to convert a PNG to both formats:

```bash
npx sharp-cli \
  -i capture.png \
  -o public/screenshots/feature-cac-lifecycle.avif -f avif --avif.quality 80
npx sharp-cli \
  -i capture.png \
  -o public/screenshots/feature-cac-lifecycle.webp -f webp --webp.quality 85
```
```

- [ ] **Step 2: Generate 10 placeholder AVIF + WebP files**

These placeholders prevent build/runtime 404s before the real capture is done. Generate a 1440 × 900 solid indigo-gradient placeholder with `sharp` on the fly:

Run (from repo root):

```bash
npx --yes sharp-cli --help >/dev/null 2>&1 || npm install --no-save sharp-cli
mkdir -p public/screenshots

for id in cac-lifecycle budget-variance timesheet-excel resource-workload productivity skills-matrix data-quality financials business-settings role-admin; do
  node -e "
    const sharp = require('sharp');
    const svg = Buffer.from(\`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 900'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#6366f1'/>
            <stop offset='1' stop-color='#ec4899'/>
          </linearGradient>
        </defs>
        <rect width='1440' height='900' fill='url(#g)' opacity='0.18'/>
        <rect x='40' y='40' width='1360' height='820' rx='24' fill='#ffffff' stroke='#e2e8f0'/>
        <text x='720' y='470' text-anchor='middle' font-family='Inter,sans-serif' font-size='42' font-weight='700' fill='#0f172a'>${id}</text>
        <text x='720' y='510' text-anchor='middle' font-family='Inter,sans-serif' font-size='18' fill='#475569'>placeholder — replace with real capture</text>
      </svg>
    \`);
    sharp(svg)
      .toFormat('webp', { quality: 85 })
      .toFile('public/screenshots/feature-${id}.webp')
      .then(() => sharp(svg).toFormat('avif', { quality: 80 }).toFile('public/screenshots/feature-${id}.avif'))
      .then(() => console.log('ok ${id}'))
      .catch(e => { console.error(e); process.exit(1); });
  "
done
```

Expected: 20 files (10 avif + 10 webp) under `public/screenshots/`.

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev` → feature cards show gradient placeholders with the feature id text. No broken-image icons. Stop server.

- [ ] **Step 4: Commit**

```bash
git add docs/screenshots-capture.md public/screenshots/
git commit -m "feat(screenshots): add capture procedure + 10 placeholder assets"
```

---

## Task 22: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate YAML locally**

Run: `node -e "require('js-yaml')" 2>/dev/null || npm install --no-save js-yaml`
Run: `node -e "const y=require('js-yaml'); const fs=require('fs'); y.load(fs.readFileSync('.github/workflows/deploy.yml','utf8')); console.log('ok')"`
Expected: prints `ok` (syntax valid).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages on push to main"
```

---

## Task 23: README + final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# coge-showcase

Bilingual (IT/EN) long-scroll marketing site for **CoGe · Cost Governance**.

Live: https://giuseppeoncia.github.io/coge-showcase/

## Stack

- Astro 5 (static)
- TypeScript
- MDX content collections for features + milestones
- Self-hosted Inter + JetBrains Mono
- Deployed to GitHub Pages via GitHub Actions

## Develop

```bash
npm install
npm run dev        # http://localhost:4321/coge-showcase/
npm run check      # astro type check
npm test           # vitest unit tests
npm run build      # → dist/
npm run preview    # serves dist/
```

## Content

- Short UI strings: `src/i18n/{it,en}.json` (parity enforced by `assertParity()` in `src/i18n/index.ts`)
- Long narrative copy: inline in `src/pages/{it,en}/index.astro`
- Feature entries: `src/content/features/*.mdx`
- Milestone entries: `src/content/milestones/*.mdx`
- Screenshots: `public/screenshots/feature-<id>.{avif,webp}` — see `docs/screenshots-capture.md`

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. Install, type-check, test, build.
2. Upload `dist/` as a Pages artifact.
3. Publish to GitHub Pages.

Repository Settings → Pages → Source must be set to **GitHub Actions**.

No custom domain; base path is `/coge-showcase/`.

## License

All rights reserved.
```

- [ ] **Step 2: Final full verification**

Run all gates sequentially:

```bash
npm run check
npm test
npm run build
```

Expected: every command exits 0.

- [ ] **Step 3: Preview the built site locally**

Run: `npm run preview`
Browse:
- `http://localhost:4321/coge-showcase/` → should redirect to `/it/` (unless `navigator.language` isn't Italian).
- `http://localhost:4321/coge-showcase/it/` → full long-scroll IT page.
- `http://localhost:4321/coge-showcase/en/` → full long-scroll EN page.
- `http://localhost:4321/coge-showcase/xxx` → 404 page.

Sanity check:
- All six chapters render in order with chapter dividers.
- Language toggle switches URL and persists to localStorage (devtools → Application → Local Storage → `coge-showcase-lang`).
- Timeline renders 10 items.
- Feature tour renders 10 cards with placeholder screenshots.
- Footer email link opens mail client.
- Repo link points to `https://github.com/giuseppeoncia/coge-showcase`.

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with dev/deploy instructions"
```

- [ ] **Step 5: Post-implementation notes for the author**

Manual follow-ups (not part of this plan, to be done by the author once implementation lands):

1. Create the public repository `giuseppeoncia/coge-showcase` on GitHub.
2. Set Pages source to "GitHub Actions" in repo Settings → Pages.
3. `git push -u origin main` → verify first workflow run is green → verify the live URL.
4. Boot CoGe locally and capture real screenshots per `docs/screenshots-capture.md`, replacing the 10 placeholder files.
5. Optional: run Lighthouse on the live URL, target ≥ 95 on all four axes.

---

## Self-Review

**Spec coverage:** Goals ✓ (Astro, bilingual, GH Pages, zero-cost, brand-agnostic — Task 1, 9, 22, 23). Information architecture 1-9 ✓ (Header Task 7, Hero 10, Chapter 01 11, Chapter 02 12, Chapter 03 14+15, Chapter 04 16, Chapter 05 17, Chapter 06 18, Footer 8). Visual language ✓ (global.css Task 2 covers palette/typography/layout; hover lifts per section; focus states). Accessibility ✓ (lang attribute, reduced motion Task 19, focus states Task 2, heading hierarchy enforced per chapter). Responsive ✓ (grid breakpoints in Tasks 2, 12, 15, 16). Performance ✓ (self-hosted fonts Task 2, AVIF+WebP in FeatureCard Task 15, lazy-loading). Screenshot workflow ✓ (Task 21). 404 ✓ (Task 20). Deploy ✓ (Task 22). Risks ✓ (`Link` wrapper Task 5 mitigates base-path hazard; localStorage IT/EN Task 6/9 mitigates routing; `assertParity()` Task 4 catches divergence).

**Placeholder scan:** No "TODO", no "add appropriate error handling", no "similar to Task N" — every task has exact code. Screenshots placeholder is intentional and documented; real capture listed as post-implementation manual follow-up.

**Type consistency:** `Lang` type defined in Task 4 used consistently in Header/Footer/LangToggle/FeatureCard/ArchitectureDiagram. `t(key, lang, vars?)` signature consistent. Feature collection field names (`title_it`, `title_en`, `body_it`, `body_en`, `screenshot`, `icon`, `id`, `order`) match between Zod schema (Task 13), MDX frontmatter (Task 14), and FeatureCard props (Task 15). Milestone fields (`version`, `date`, `title_it`, `title_en`, `blurb_it`, `blurb_en`) match between schema (Task 13), MDX (Task 17), and TimelineItem props (Task 17).
