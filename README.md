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
