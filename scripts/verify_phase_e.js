import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('docs/screenshots');

async function verifyPhaseE() {
  console.log('[Phase E Verification] Launching Edge browser...');
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
    // 1. RBAC Test with Admin login
    console.log('[Phase E Verification] Testing Admin login (admin@foodsense.lk)...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@foodsense.lk');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:5173/', { timeout: 10000 });
    await page.waitForSelector('text=Dr. Samantha Wickramasinghe', { timeout: 5000 });
    await page.waitForSelector('span:has-text("Admin")', { timeout: 5000 });
    console.log('✅ Admin login & role badge verified.');

    // 2. Kitchen Mode: Quick Waste Logging
    console.log('[Phase E Verification] Navigating to /quick-log...');
    await page.goto('http://127.0.0.1:5173/quick-log', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Rapid Kitchen Waste Entry Station', { timeout: 8000 });

    // Select product button (Wood-Fired Roast Paan or first product)
    const productCard = page.locator('button:has-text("Wood-Fired Roast Paan")').first();
    if (await productCard.count() > 0) {
      await productCard.click();
    }

    // Click quick quantity "2"
    await page.click('button:has-text("2")');

    // Click "Prep Trim" reason
    await page.click('button:has-text("Prep Trim")');

    // Submit waste log
    await page.click('button:has-text("1-Tap Confirm & Log Waste")');
    await page.waitForSelector('text=Saved to Ledger', { timeout: 8000 });
    console.log('✅ 1-Tap Quick Waste logged successfully.');

    await page.screenshot({
      path: path.join(screenshotDir, '29_quick_waste_logging.png'),
      fullPage: true,
    });
    console.log('✅ Screenshot saved: docs/screenshots/29_quick_waste_logging.png');

    // 3. Multi-Language Switcher (Sinhala & Tamil)
    console.log('[Phase E Verification] Testing Multi-Language UI (Sinhala)...');
    const langSelect = page.locator('select[aria-label="Language Selector"]');
    await langSelect.selectOption('si');
    await page.waitForSelector('text=ප්‍රධාන පුවරුව (Dashboard)', { timeout: 5000 });

    await page.screenshot({
      path: path.join(screenshotDir, '30_multilanguage_sinhala.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/30_multilanguage_sinhala.png');

    console.log('[Phase E Verification] Testing Multi-Language UI (Tamil)...');
    await langSelect.selectOption('ta');
    await page.waitForSelector('text=முகப்பு பலகை (Dashboard)', { timeout: 5000 });

    await page.screenshot({
      path: path.join(screenshotDir, '31_multilanguage_tamil.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/31_multilanguage_tamil.png');

    // Switch back to English
    await langSelect.selectOption('en');
    await page.waitForSelector('text=Dashboard', { timeout: 5000 });

    // 4. Guided Pitch Tour Modal
    console.log('[Phase E Verification] Testing Guided Demo Pitch Tour...');
    await page.click('button[title="Start University Demo Pitch Tour"]');
    await page.waitForSelector('text=University Project Overview: FoodSense Vision', { timeout: 5000 });

    // Advance to step 2
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text=Demand Forecasting with Weather & Event Regressors', { timeout: 5000 });

    await page.screenshot({
      path: path.join(screenshotDir, '32_guided_pitch_tour.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/32_guided_pitch_tour.png');

    // Advance through remaining steps and finish
    for (let i = 2; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(200);
    }
    await page.click('button:has-text("Finish Tour")');

    console.log('🎉 Phase E verification passed with flying colors!');
  } catch (err) {
    console.error('❌ Phase E verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhaseE();
