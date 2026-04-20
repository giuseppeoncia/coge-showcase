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
