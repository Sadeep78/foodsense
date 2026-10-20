const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const lightDir = path.resolve('docs/screenshots/audit_light');
const darkDir = path.resolve('docs/screenshots/audit_dark');

if (!fs.existsSync(lightDir)) fs.mkdirSync(lightDir, { recursive: true });
if (!fs.existsSync(darkDir)) fs.mkdirSync(darkDir, { recursive: true });

const pagesToAudit = [
  { name: '01_login', path: '/login', isPublic: true },
  { name: '02_dashboard', path: '/' },
  { name: '03_insights', path: '/insights' },
  { name: '04_donations', path: '/donations' },
  { name: '05_goals', path: '/goals' },
  { name: '06_upload', path: '/upload' },
  { name: '07_forecasts', path: '/forecasts' },
  { name: '08_events', path: '/events' },
  { name: '09_margins', path: '/margins' },
  { name: '10_recommendations', path: '/recommendations' },
  { name: '11_alerts', path: '/alerts' },
  { name: '12_sustainability', path: '/sustainability' },
  { name: '13_reports', path: '/reports' },
  { name: '14_outlets', path: '/outlets' },
  { name: '15_suppliers', path: '/suppliers' },
  { name: '16_recipes', path: '/recipes' },
  { name: '17_quick_log', path: '/quick-log' },
  { name: '18_settings', path: '/settings' },
];

(async () => {
  console.log('🚀 Starting Comprehensive UI Audit Screen Capture...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Audit Login in Light & Dark Mode
  console.log('[Audit] Checking /login (Light & Dark)...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(lightDir, '01_login.png') });

  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(darkDir, '01_login.png') });

  // 2. Perform Login
  console.log('[Audit] Logging in with demo credentials...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.fill('input[type="email"]', 'manager@foodsense.lk');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Loop through all authenticated routes
  for (const p of pagesToAudit) {
    if (p.isPublic) continue;
    console.log(`[Audit] Capturing ${p.name} (${p.path})...`);
    await page.goto(`http://127.0.0.1:5173${p.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    // Light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foodsense_theme', 'light');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(lightDir, `${p.name}.png`), fullPage: false });

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foodsense_theme', 'dark');
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(darkDir, `${p.name}.png`), fullPage: false });
  }

  console.log(`\n✅ Completed! Captured 18 light and 18 dark mode audit screenshots.`);
  await browser.close();
})();
