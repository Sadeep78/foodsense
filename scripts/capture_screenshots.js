import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('docs/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('[Test] Launching browser with msedge channel...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log('[Test] 1. Visiting Login Page...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(screenshotDir, '01_login.png'), fullPage: false });
  console.log('✓ Captured 01_login.png');

  console.log('[Test] 2. Logging in with demo credentials...');
  const demoBtn = page.getByRole('button', { name: /1-Click Auto-Fill & Instant Login/i });
  await demoBtn.click();

  // Wait for redirect to dashboard
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500); // allow charts to animate

  console.log('[Test] 3. Capturing Dashboard...');
  await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png'), fullPage: true });
  console.log('✓ Captured 02_dashboard.png');

  console.log('[Test] 4. Visiting Upload & Validation Page...');
  await page.goto('http://127.0.0.1:5173/upload');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '03_upload.png'), fullPage: true });
  console.log('✓ Captured 03_upload.png');

  console.log('[Test] 5. Visiting Demand Forecasts Page...');
  await page.goto('http://127.0.0.1:5173/forecasts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotDir, '04_forecasts.png'), fullPage: true });
  console.log('✓ Captured 04_forecasts.png');

  console.log('[Test] 6. Visiting Order Recommendations Page...');
  await page.goto('http://127.0.0.1:5173/recommendations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, '05_recommendations.png'), fullPage: true });
  console.log('✓ Captured 05_recommendations.png');

  console.log('[Test] 7. Visiting Expiry Risk Alerts Page...');
  await page.goto('http://127.0.0.1:5173/alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, '06_alerts.png'), fullPage: true });
  console.log('✓ Captured 06_alerts.png');

  console.log('[Test] 8. Visiting Waste Reports & What-If Page...');
  await page.goto('http://127.0.0.1:5173/reports');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotDir, '07_reports_what_if.png'), fullPage: true });
  console.log('✓ Captured 07_reports_what_if.png');

  console.log('[Test] 9. Visiting Settings Page...');
  await page.goto('http://127.0.0.1:5173/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '08_settings.png'), fullPage: true });
  console.log('✓ Captured 08_settings.png');

  console.log('[Test] All page screenshots successfully verified and saved!');
  await browser.close();
}

run().catch((err) => {
  console.error('[Test Error]:', err);
  process.exit(1);
});
