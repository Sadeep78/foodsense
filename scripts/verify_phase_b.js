import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('docs/screenshots');

async function verifyPhaseB() {
  console.log('[Phase B Verification] Launching Edge browser...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]', msg.text());
    }
  });

  // 1. Login
  console.log('[Phase B Verification] 1. Logging into FoodSense...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /1-Click Auto-Fill & Instant Login/i }).click();
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');

  // 2. Verify Profit & Margins Analysis Page
  console.log('[Phase B Verification] 2. Verifying /margins page with Quadrant Scatter...');
  await page.goto('http://127.0.0.1:5173/margins');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '19_profit_margins_quadrant.png'), fullPage: true });
  console.log('✓ Captured 19_profit_margins_quadrant.png');

  // Test search in SKU matrix
  const searchInput = page.locator('input[placeholder*="Search SKU"]');
  if (await searchInput.count() > 0) {
    await searchInput.fill('Kottu');
    await page.waitForTimeout(400);
    console.log('✓ Filtered SKU matrix by "Kottu"');
    await searchInput.fill('');
  }

  // 3. Verify Weather & Events Impact Page
  console.log('[Phase B Verification] 3. Verifying /events page...');
  await page.goto('http://127.0.0.1:5173/events');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '20_weather_and_events_calendar.png'), fullPage: true });
  console.log('✓ Captured 20_weather_and_events_calendar.png');

  // Open Schedule Custom Event modal
  const scheduleBtn = page.getByRole('button', { name: /Schedule Custom Event/i });
  await scheduleBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '21_custom_event_modal.png') });
  console.log('✓ Captured 21_custom_event_modal.png');

  // Close modal
  const cancelBtn = page.getByRole('button', { name: /Cancel/i });
  await cancelBtn.click();
  await page.waitForTimeout(300);

  // 4. Verify Forecast Explainability & Waterfall Modal on /forecasts
  console.log('[Phase B Verification] 4. Verifying /forecasts with "Why this Forecast?" Explainability...');
  await page.goto('http://127.0.0.1:5173/forecasts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const explainBtn = page.getByRole('button', { name: /Why this Forecast\?/i });
  await explainBtn.click();
  await page.waitForSelector('text=Forecast Explainability & Decomposition', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotDir, '22_forecast_explainability_modal.png') });
  console.log('✓ Captured 22_forecast_explainability_modal.png');

  await browser.close();
  console.log('\n[Phase B Verification] ALL PHASE B TESTS PASSED! All 4 screenshots captured successfully.');
}

verifyPhaseB().catch((err) => {
  console.error('[Phase B Verification Failed]', err);
  process.exit(1);
});
