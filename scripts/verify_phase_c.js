import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('docs/screenshots');

async function verifyPhaseC() {
  console.log('[Phase C Verification] Launching Edge browser...');
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
    console.log('[Phase C Verification] Logging in as manager@foodsense.lk...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'manager@foodsense.lk');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:5173/', { timeout: 10000 });
    console.log('[Phase C Verification] Logged in successfully.');

    // 2. Navigate to Sustainability Scorecard
    console.log('[Phase C Verification] Navigating to /sustainability...');
    await page.goto('http://127.0.0.1:5173/sustainability', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Green Sustainability Scorecard', { timeout: 8000 });
    await page.waitForSelector('text=Carbon Emissions Avoided', { timeout: 8000 });
    await page.waitForSelector('text=Sustainability Milestone Badges', { timeout: 8000 });

    // Capture screenshot of Sustainability page
    await page.screenshot({
      path: path.join(screenshotDir, '23_sustainability_scorecard.png'),
      fullPage: true,
    });
    console.log('✅ Screenshot saved: docs/screenshots/23_sustainability_scorecard.png');

    // 3. Test Header Notification Centre
    console.log('[Phase C Verification] Testing Notification Centre in Header...');
    const bellButton = page.locator('button[title="Notification Centre"]');
    await bellButton.click();
    await page.waitForSelector('text=Notification Centre', { timeout: 5000 });
    await page.waitForSelector('text=Mark all read', { timeout: 5000 });

    // Screenshot of open notifications drawer
    await page.screenshot({
      path: path.join(screenshotDir, '24_notifications_center.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/24_notifications_center.png');

    // Click "Mark all read"
    await page.click('text=Mark all read');
    await page.waitForTimeout(1000);

    // 4. Test Scheduled Email Digest
    console.log('[Phase C Verification] Navigating to /reports to test Scheduled Weekly Email Digest...');
    await page.goto('http://127.0.0.1:5173/reports', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Email Weekly Digest', { timeout: 8000 });

    // Click Email Weekly Digest
    await page.click('text=Email Weekly Digest');
    await page.waitForSelector('text=Schedule Weekly Executive Email Digest', { timeout: 5000 });

    // Click Dispatch Email Summary
    await page.click('button:has-text("Dispatch Email Summary")');
    await page.waitForSelector('text=Weekly Highlights:', { timeout: 8000 });

    // Capture screenshot of email preview modal
    await page.screenshot({
      path: path.join(screenshotDir, '25_scheduled_email_summary.png'),
    });
    console.log('✅ Screenshot saved: docs/screenshots/25_scheduled_email_summary.png');

    console.log('🎉 Phase C verification passed with flying colors!');
  } catch (err) {
    console.error('❌ Phase C verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhaseC();
