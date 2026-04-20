# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bilingual (IT/EN) long-scroll marketing site for **CoGe · Cost Governance**. Static Astro 5 output, deployed to GitHub Pages at base path `/coge-showcase/`. The screenshots and copy showcase the CoGe product (separate repo at `~/projects/giuseppeoncia/coge`).

## Commands

```bash
npm run dev        # http://localhost:4321/coge-showcase/
npm run check      # astro type check (tsconfig extends astro/tsconfigs/strict)
npm test           # vitest
npm run build      # → dist/ (static)
npm run preview    # serves dist/

# single test
npx vitest run src/i18n/index.test.ts
```

## Architecture

**Two first-class locale pages, not a translation layer.** `src/pages/it/index.astro` and `src/pages/en/index.astro` duplicate narrative content intentionally. Short UI strings route through `t(key, lang)` in `src/i18n/index.ts`, which asserts IT/EN key parity at build time via `assertParity()` (covered by a vitest).

**Root index is a client-side redirect**, not an Astro i18n default. `src/pages/index.astro` detects `localStorage.coge-showcase-lang` → `navigator.language` → falls back to `/it/`. This requires `i18n.routing.redirectToDefaultLocale: false` in `astro.config.mjs`, otherwise Astro generates its own redirect page and our custom `<script>` never ships.

**Everything under `src/pages/{it,en}` must prefix internal links with `import.meta.env.BASE_URL`.** A hard-coded `/features/...` would 404 in production because the site is served under `/coge-showcase/`. `src/components/Link.astro` wraps this; new internal links should route through it (or replicate the prefix logic inline). A few direct anchors in `public/404.html` are hardcoded because `public/` files are not templated — update them manually if the base path changes.

**Chapters are tagged `data-reveal`**; `src/components/ScrollReveal.astro` (mounted once in `BaseLayout`) uses a single `IntersectionObserver` to fade them in and respects `prefers-reduced-motion`.

**Single shared `<dialog>` lightbox** lives in `src/components/Lightbox.astro` (also mounted once in `BaseLayout`). `FeatureCard` buttons carry `data-avif`/`data-webp`/`data-caption`; click delegation at the document level populates the dialog and calls `showModal()`. No lightbox library.

**Content collections** (`src/content/config.ts`):
- `features` — 10 MDX entries, sorted by `order`, rendered in Chapter 03
- `milestones` — MDX entries sorted by ISO `date`, rendered in Chapter 05

Per-feature screenshots live in `public/screenshots/feature-<id>.{avif,webp}`; `FeatureCard` emits a `<picture>` with AVIF → WebP fallback and fixed 1440×900 aspect.

## Screenshot capture pipeline

`scripts/capture-screenshots.mjs` drives Puppeteer against a locally-running CoGe instance. Non-obvious gotchas baked in:

- **`COGE_BASE_URL` defaults to `https://analytics.coge.orb.local`**, not `localhost`. Filament builds asset URLs (including `x-load` lazy JS bundles for `TagsInput`, `KeyValue`, etc.) from the server's `APP_URL`. When Puppeteer hits localhost, those lazy-loaded Alpine components never hydrate — forms look empty even though Livewire state has real data. Using OrbStack's HTTPS host matches `APP_URL` and everything resolves.
- **`ignoreHTTPSErrors: true`** in the browser launch is required for the `.orb.local` self-signed cert.
- **Login submit on Filament uses Enter on the password field**, not `.click()` on the submit button — the button sits below the fold in the 1440×900 viewport and `page.click` misses or picks up the wrong element.
- **After navigation, wait for hydration then scroll the page top→bottom→top** to trigger every Alpine `x-load` `IntersectionObserver`; components that stay outside the viewport never initialize in headless Chromium. Per-target `waitForText` + `settleMs` knobs handle slow Livewire pages (e.g., `business-settings` waits for the `LAB` tag pill to appear).
- **The "Data Quality" sidebar link in Filament points at `/debug`** (Blade `DebugController`), not any `/admin/data-quality` route. There is no such admin route.
- **MongoDB container restarts mid-run produce a Flare error page** as the screenshot. If `resource-workload.png` or similar shows a `MongoDB\Driver\Exception\ConnectionTimeoutException`, wait for `docker compose ps mongo` to report `(healthy)` and re-run.

Debugbar is hidden via injected CSS. PII handling is **not** done by the capture script — the DB is anonymized separately.

## DB anonymization

`scripts/anonymize-db.js` is a mongosh script (loaded via `docker cp` + `docker exec`). It deterministically renames employees, customers, users, and CAC `Resources:` description fragments using a hash of each document's `_id`. It is **env-driven**:

- `KEEP_LOGIN_EMAIL` preserves one user's email so Puppeteer can still authenticate after anonymization.
- Credentials are passed through the shell (`source .env && docker exec ... -u "$MONGO_USER" -p "$MONGO_PASSWORD"`); nothing is hardcoded in the script.

`DRY_RUN=true` prints the first 5 mapped examples per collection without writing. CAC description anonymization only catches the `Resources: LASTNAME (...)` pattern; other description strings (project names like "Sviluppo Permit Portal") are intentionally left alone — adapt if more coverage is needed.

## Deploy

GitHub Actions workflow at `.github/workflows/deploy.yml`. Requires repo Settings → Pages → Source = "GitHub Actions". No custom domain. Force pushes to `main` are acceptable as long as the remote is private; the history was nuked once already to purge unanonymized screenshots from pre-anonymization commits.
