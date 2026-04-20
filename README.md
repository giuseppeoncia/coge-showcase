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

## Environment

Scripts under `scripts/` read configuration from environment variables. Copy
the template and fill in your local values:

```bash
cp .env.example .env
# edit .env
```

Variables:

| Name               | Used by                         | Purpose                                                  |
|--------------------|---------------------------------|----------------------------------------------------------|
| `COGE_EMAIL`       | `scripts/capture-screenshots.mjs` | Admin login email for Filament + Blade auth              |
| `COGE_PASSWORD`    | `scripts/capture-screenshots.mjs` | Admin login password                                     |
| `COGE_BASE_URL`    | `scripts/capture-screenshots.mjs` | Local CoGe URL (defaults to OrbStack `analytics.coge.orb.local`) |
| `MONGO_USER`       | `scripts/anonymize-db.js` (via shell) | Mongo auth user for the local dev container              |
| `MONGO_PASSWORD`   | `scripts/anonymize-db.js` (via shell) | Mongo auth password for the local dev container          |
| `MONGO_DB`         | `scripts/anonymize-db.js` (via shell) | Target database name (e.g. `coge_db`)                    |
| `KEEP_LOGIN_EMAIL` | `scripts/anonymize-db.js`         | Optional; preserve one user record to keep login working |

Run scripts with Node's native `--env-file` loader (no dotenv dependency):

```bash
node --env-file=.env scripts/capture-screenshots.mjs
```

For `anonymize-db.js` (mongosh script), source `.env` and invoke mongosh
with the credentials expanded at runtime so nothing lands in shell history
literally:

```bash
set -a; source .env; set +a
docker cp scripts/anonymize-db.js coge-mongo:/tmp/anonymize-db.js
docker exec coge-mongo mongosh \
  --authenticationDatabase admin \
  -u "$MONGO_USER" -p "$MONGO_PASSWORD" \
  "$MONGO_DB" \
  --eval "var KEEP_LOGIN_EMAIL='$KEEP_LOGIN_EMAIL'; load('/tmp/anonymize-db.js');"
```

`.env` is gitignored. Never commit a populated copy.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. Install, type-check, test, build.
2. Upload `dist/` as a Pages artifact.
3. Publish to GitHub Pages.

Repository Settings → Pages → Source must be set to **GitHub Actions**.

No custom domain; base path is `/coge-showcase/`.

## License

All rights reserved.
