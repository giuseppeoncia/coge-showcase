# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-20

### Added
- Astro 5 static bilingual (IT / EN) long-scroll marketing site under base path `/coge-showcase/`.
- Hero + six chapters: Problem, Four Pillars, Feature Tour, Under the Hood, Evolution, Who It's For.
- i18n helper (`src/i18n/index.ts`) with JSON dictionaries and `assertParity()` covered by a vitest.
- Content collections for `features` (10 bilingual entries) and `milestones` (10 CHANGELOG-derived entries).
- Custom SVG illustrations: `HeroIllustration`, `ProblemIllustration`, `ArchitectureDiagram`.
- `FeatureCard` with AVIF + WebP `<picture>`, lazy-loaded, fixed 1440×900 aspect.
- Click-to-enlarge lightbox via a single shared `<dialog>` mounted in `BaseLayout` (`Lightbox.astro`); ESC, backdrop click, close button, zoom-in cursor.
- `ScrollReveal.astro` with one `IntersectionObserver` for all `[data-reveal]` chapter sections; fade + translate, respects `prefers-reduced-motion`.
- Root redirect shim (`src/pages/index.astro`) with `localStorage` + `navigator.language` detection.
- Custom bilingual `public/404.html`.
- `Link.astro` wrapper that prefixes `import.meta.env.BASE_URL` for internal hrefs.
- Screenshot capture pipeline (`scripts/capture-screenshots.mjs`): Puppeteer + sharp, Filament and Blade login, Alpine lazy-load trigger via top→bottom→top scroll, per-target `waitForText` + `settleMs`, debugbar hidden via injected CSS, AVIF + WebP export.
- DB anonymization helper (`scripts/anonymize-db.js`): deterministic fake-name mapping for employees, customers, users, and CAC `Resources:` description fragments; env-driven `KEEP_LOGIN_EMAIL`.
- GitHub Actions deploy workflow (`.github/workflows/deploy.yml`): type-check, test, build, upload-pages-artifact, deploy-pages.
- `.env.example` documenting every environment variable consumed by the scripts.
- `CLAUDE.md` with architecture notes and non-obvious capture-pipeline gotchas.
- `docs/screenshots-capture.md` manual capture procedure; `README.md` dev + deploy guide.

### Fixed
- Astro auto-redirect was shadowing our custom root `index.astro`; set `i18n.routing.redirectToDefaultLocale: false` so the locale-detect script actually ships.
- Capture script logged into Filament by clicking the submit button, which sits below the 1440×900 fold; switched to pressing Enter on the password field.
- Filament `x-load` asset URLs are built from `APP_URL`; running Puppeteer against a different host left Alpine components un-hydrated. Now requires `COGE_BASE_URL` to match `APP_URL` exactly.
- "Data Quality" sidebar link in Filament actually routes to `/debug` (Blade `DebugController`), not any `/admin/data-quality` path.
- Livewire-heavy pages (e.g. `business-settings`) needed explicit hydration waits before screenshot.

### Changed
- Root redirect fallback flipped from `/it/` to `/en/`. Only `navigator.language` starting with `it*` now resolves to Italian; every other locale and every failure path lands on English.
- Screenshot-capture pipeline no longer applies any blur overlay. PII is handled at the data layer via the anonymization script; numbers remain readable, names come from the fake-data pool.
- `scripts/capture-screenshots.mjs` no longer hardcodes a default `COGE_BASE_URL`; the script now exits with an actionable error if the env var is unset.
- `scripts/anonymize-db.js` no longer hardcodes `KEEP_LOGIN_EMAIL`; the value is injected via mongosh `--eval`.

### Security
- Entire git history rewritten once before the repo went public to purge pre-anonymization screenshots. Credentials for the local CoGe login and the local MongoDB container are kept out of code and committed docs; every script reads them from `.env` at runtime.
