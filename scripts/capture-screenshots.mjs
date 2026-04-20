import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.COGE_BASE_URL || 'https://analytics.coge.orb.local';
const EMAIL = process.env.COGE_EMAIL;
const PASSWORD = process.env.COGE_PASSWORD;
const OUT = 'public/screenshots';

if (!EMAIL || !PASSWORD) {
  console.error('Set COGE_EMAIL and COGE_PASSWORD env vars');
  process.exit(1);
}

/**
 * No blur applied. Screenshots go as-is. PII / anonymization is handled at the
 * data layer (seeder). Debugbar is still hidden via CSS for visual cleanliness.
 */
const targets = [
  { id: 'cac-lifecycle',     path: '/admin/cost-allocation-codes' },
  { id: 'budget-variance',   path: '/budget-vs-actual' },
  { id: 'timesheet-excel',   path: '/admin/timesheets' },
  { id: 'resource-workload', path: '/employee-workload' },
  { id: 'productivity',      path: '/productivity' },
  { id: 'skills-matrix',     path: '/skills' },
  { id: 'data-quality',      path: '/debug' },
  { id: 'financials',        path: '/financials' },
  {
    id: 'business-settings',
    path: '/admin/settings-page',
    settleMs: 1500,
    // TagsInput values render as pills with the tag text; LAB is a seeded Business Unit.
    waitForText: 'LAB',
  },
  { id: 'role-admin',        path: '/admin/users' },
];

async function loginFilament(page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);
  await new Promise((r) => setTimeout(r, 500));
  await page.focus('input[type="password"]');
  await page.keyboard.press('Enter');
  try {
    await page.waitForFunction(() => !location.pathname.includes('/admin/login'), { timeout: 30000 });
  } catch (e) {
    await page.screenshot({ path: 'tmp-captures/_login-debug.png' });
    throw e;
  }
  await new Promise((r) => setTimeout(r, 1000));
  console.log('  Filament login ok');
}

async function loginBlade(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  const emailSel = await page.$('input[name="email"]');
  if (!emailSel) {
    console.log('  Blade login: already authenticated via shared session');
    return;
  }
  await page.type('input[name="email"]', EMAIL);
  await page.type('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log('  Blade login ok');
}

const GLOBAL_MASK_CSS = `
  /* Hide laravel debugbar — visual noise only, not PII */
  #phpdebugbar, .phpdebugbar, [id^="debugbar"], .phpdebugbar-openhandler,
  .phpdebugbar-minimized, .phpdebugbar-body { display: none !important; }
`;

async function waitForHydration(page) {
  // Livewire + Filament often keep rendering after networkidle2. Wait for:
  //   1. document readyState complete
  //   2. no visible wire:loading elements
  //   3. no filament .fi-loading-indicator with display !== none
  await page.waitForFunction(
    () => {
      if (document.readyState !== 'complete') return false;
      const loaders = document.querySelectorAll(
        '[wire\\:loading]:not([style*="display: none"]), .fi-loading-indicator:not([style*="display: none"])'
      );
      for (const el of loaders) {
        const st = window.getComputedStyle(el);
        if (st.display !== 'none' && st.visibility !== 'hidden') return false;
      }
      return true;
    },
    { timeout: 15000 }
  ).catch(() => {}); // best-effort; fall through to settle buffer
}

async function triggerLazyLoad(page) {
  // Filament uses Alpine `x-load` for lazy component init. Components that
  // never enter the viewport stay un-hydrated (empty). Scroll the page
  // top→bottom→top to trigger every IntersectionObserver then settle.
  await page.evaluate(async () => {
    const steps = 10;
    const h = document.documentElement.scrollHeight;
    for (let i = 0; i <= steps; i++) {
      window.scrollTo(0, (h / steps) * i);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
}

async function capture(page, target, outPng) {
  const url = `${BASE}${target.path}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.addStyleTag({ content: GLOBAL_MASK_CSS });
  await waitForHydration(page);
  await triggerLazyLoad(page);

  if (target.waitForText) {
    await page.waitForFunction(
      (needle) => document.body && document.body.innerText.includes(needle),
      { timeout: 15000 },
      target.waitForText
    ).catch(() => console.warn(`  (waitForText "${target.waitForText}" never satisfied)`));
  }

  const settle = target.settleMs ?? 1500;
  await new Promise((r) => setTimeout(r, settle));
  await page.screenshot({ path: outPng, type: 'png', fullPage: false });
}

async function toFormats(png, id) {
  const buf = fs.readFileSync(png);
  await sharp(buf).toFormat('webp', { quality: 85 }).toFile(path.join(OUT, `feature-${id}.webp`));
  await sharp(buf).toFormat('avif', { quality: 80 }).toFile(path.join(OUT, `feature-${id}.avif`));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync('tmp-captures', { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  console.log('Logging in…');
  await loginFilament(page);
  await loginBlade(page);

  for (const target of targets) {
    const png = `tmp-captures/${target.id}.png`;
    console.log(`Capturing ${target.id} ← ${target.path}`);
    try {
      await capture(page, target, png);
      await toFormats(png, target.id);
      console.log(`  ok`);
    } catch (err) {
      console.error(`  FAILED ${target.id}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done.');
})();
