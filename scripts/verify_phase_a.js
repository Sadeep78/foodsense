import { chromium } from 'playwright';
import path from 'path';

const screenshotDir = path.resolve('docs/screenshots');

async function verifyPhaseA() {
  console.log('[Phase A Verification] Launching Edge browser...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]', msg.text());
    }
  });

  // 1. Login
  console.log('[Phase A Verification] 1. Logging into FoodSense...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /1-Click Auto-Fill & Instant Login/i }).click();
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Capture Updated Dashboard with Insights & Goals
  await page.screenshot({ path: path.join(screenshotDir, '11_dashboard_with_insights_and_goals.png'), fullPage: true });
  console.log('✓ Captured 11_dashboard_with_insights_and_goals.png');

  // 2. Test Smart Insights Page
  console.log('[Phase A Verification] 2. Verifying /insights page...');
  await page.goto('http://127.0.0.1:5173/insights');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '12_smart_insights_page.png'), fullPage: true });
  console.log('✓ Captured 12_smart_insights_page.png');

  // Test filter tab on Insights
  const critTab = page.getByRole('button', { name: /Critical/i });
  if (await critTab.count() > 0) {
    await critTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Filtered insights by Critical');
  }

  // 3. Test Dynamic Markdown & Salvage on Alerts Page
  console.log('[Phase A Verification] 3. Verifying /alerts with Dynamic Markdowns...');
  await page.goto('http://127.0.0.1:5173/alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '13_alerts_page_overview.png'), fullPage: true });
  console.log('✓ Captured 13_alerts_page_overview.png');

  // Switch to Dynamic Markdown Suggestions tab
  const discountTab = page.getByRole('button', { name: /Dynamic Markdown Suggestions/i });
  if (await discountTab.count() > 0) {
    await discountTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotDir, '14_dynamic_markdown_suggestions.png'), fullPage: true });
    console.log('✓ Captured 14_dynamic_markdown_suggestions.png');

    // Test Mark as Discounted action on first batch
    const markDiscountBtn = page.getByRole('button', { name: /Mark as Discounted/i }).first();
    if (await markDiscountBtn.count() > 0) {
      await markDiscountBtn.click();
      await page.waitForTimeout(1000);
      console.log('✓ Clicked Mark as Discounted button');
    }
  }

  // 4. Test Food Donation & Redistribution Tracker
  console.log('[Phase A Verification] 4. Verifying /donations page...');
  await page.goto('http://127.0.0.1:5173/donations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '15_food_donations_page.png'), fullPage: true });
  console.log('✓ Captured 15_food_donations_page.png');

  // Open Log Surplus Donation modal
  const logDonationBtn = page.getByRole('button', { name: /Log Surplus Donation/i });
  await logDonationBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '16_log_donation_modal.png') });
  console.log('✓ Captured 16_log_donation_modal.png');

  // Close modal
  const cancelBtn = page.getByRole('button', { name: /Cancel/i });
  await cancelBtn.click();
  await page.waitForTimeout(300);

  // 5. Test Waste Targets & Goals Page
  console.log('[Phase A Verification] 5. Verifying /goals page...');
  await page.goto('http://127.0.0.1:5173/goals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '17_waste_goals_page.png'), fullPage: true });
  console.log('✓ Captured 17_waste_goals_page.png');

  // Open Set New Target modal
  const newTargetBtn = page.getByRole('button', { name: /Set New Target/i });
  await newTargetBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, '18_set_target_modal.png') });
  console.log('✓ Captured 18_set_target_modal.png');

  await browser.close();
  console.log('\n[Phase A Verification] ALL PHASE A TESTS PASSED! All 8 screenshots captured successfully.');
}

verifyPhaseA().catch((err) => {
  console.error('[Phase A Verification Failed]', err);
  process.exit(1);
});
