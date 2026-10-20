import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('docs/screenshots');

async function verifyPhaseD() {
  console.log('[Phase D Verification] Launching Edge browser...');
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

  try {
    // 1. Login
    console.log('[Phase D Verification] Logging in as manager@foodsense.lk...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'manager@foodsense.lk');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:5173/', { timeout: 10000 });
    console.log('[Phase D Verification] Logged in successfully.');

    // 2. Outlets & Leaderboard
    console.log('[Phase D Verification] Navigating to /outlets...');
    await page.goto('http://127.0.0.1:5173/outlets', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Branch Benchmarks & Waste Leaderboard', { timeout: 8000 });
    await page.waitForSelector('h4:has-text("Colombo Central")', { timeout: 8000 });
    await page.waitForSelector('h4:has-text("Kandy Hillside")', { timeout: 8000 });

    await page.screenshot({
      path: path.join(screenshotDir, '26_outlets_leaderboard.png'),
      fullPage: true,
    });
    console.log('✅ Screenshot saved: docs/screenshots/26_outlets_leaderboard.png');

    // 3. Suppliers & Price Trajectory
    console.log('[Phase D Verification] Navigating to /suppliers...');
    await page.goto('http://127.0.0.1:5173/suppliers', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Supplier Directory & Price Spikes', { timeout: 8000 });
    await page.waitForSelector('text=Lanka Fresh Agro Distributors', { timeout: 8000 });

    // Click "Inspect Price Trajectory" on first supplier
    const trajectoryBtn = page.locator('button:has-text("Inspect Price Trajectory")').first();
    await trajectoryBtn.click();
    await page.waitForSelector('text=12-Week Procurement Price History', { timeout: 6000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotDir, '27_supplier_price_trajectory.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/27_supplier_price_trajectory.png');

    // Close modal
    await page.click('button:has-text("Close")');

    // 4. Recipes & Ingredient Explosion
    console.log('[Phase D Verification] Navigating to /recipes...');
    await page.goto('http://127.0.0.1:5173/recipes', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Recipe & Ingredient-Level Forecasting', { timeout: 8000 });
    await page.waitForSelector('text=Aggregated Raw Ingredient Purchase Orders', { timeout: 8000 });

    await page.screenshot({
      path: path.join(screenshotDir, '28_recipe_ingredient_explosion.png'),
      fullPage: true,
    });
    console.log('✅ Screenshot saved: docs/screenshots/28_recipe_ingredient_explosion.png');

    console.log('🎉 Phase D verification passed with flying colors!');
  } catch (err) {
    console.error('❌ Phase D verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhaseD();
