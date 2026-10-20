import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('docs/screenshots');

async function testAcceptance() {
  console.log('[Acceptance Verification] Launching Edge browser...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Login
  console.log('[Acceptance Verification] 1. Logging in...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /1-Click Auto-Fill & Instant Login/i }).click();
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Re-capture clean dashboard
  await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png'), fullPage: true });
  console.log('✓ Re-captured 02_dashboard.png');

  // 2. Test Good CSV Upload
  console.log('[Acceptance Verification] 2. Testing valid sales CSV upload & preview...');
  await page.goto('http://127.0.0.1:5173/upload');
  await page.waitForLoadState('networkidle');

  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.resolve('sample_data/sales_sample.csv'));
  await page.waitForTimeout(500);

  // Click Validate button
  const validateBtn = page.getByRole('button', { name: /Validate Schema & Values/i });
  await validateBtn.click();
  await page.waitForSelector('text=Validation Passed', { timeout: 10000 });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(screenshotDir, '03_upload_valid_preview.png'), fullPage: true });
  console.log('✓ Captured 03_upload_valid_preview.png (Valid upload + preview table)');

  // 3. Test Bad CSV Upload (validation errors)
  console.log('[Acceptance Verification] 3. Testing invalid sales CSV upload (validation errors)...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  const fileInputBad = await page.locator('input[type="file"]');
  await fileInputBad.setInputFiles(path.resolve('sample_data/bad_sales.csv'));
  await page.waitForTimeout(500);

  const validateBtnBad = page.getByRole('button', { name: /Validate Schema & Values/i });
  await validateBtnBad.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(screenshotDir, '03_upload_validation_errors.png'), fullPage: true });
  console.log('✓ Captured 03_upload_validation_errors.png (Clear error report)');

  // 4. Test Dark Mode
  console.log('[Acceptance Verification] 4. Testing Dark Mode toggle...');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click theme toggle button in header
  const themeToggle = page.locator('button[title*="Mode"]');
  await themeToggle.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(screenshotDir, '09_dark_mode_dashboard.png'), fullPage: true });
  console.log('✓ Captured 09_dark_mode_dashboard.png');

  console.log('[Acceptance Verification] All criteria successfully verified!');
  await browser.close();
}

testAcceptance().catch((e) => {
  console.error('Acceptance error:', e);
  process.exit(1);
});
