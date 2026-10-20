const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('docs/screenshots/insights_redesign');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('🚀 Running Smart Insights Redesign Verification...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Login
  console.log('Logging in...');
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'manager@foodsense.lk');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://127.0.0.1:5173/');

  // Navigate to /insights
  console.log('Navigating to /insights...');
  await page.goto('http://127.0.0.1:5173/insights');
  await page.waitForSelector('h1:has-text("Smart Operational Insights")');
  await page.waitForSelector('text=Potential Savings');
  await page.waitForTimeout(1000);

  // 1. Light Mode Desktop (1440x900)
  console.log('Capturing Insights - Light Mode Desktop...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'insights_desktop_light.png'), fullPage: false });
  await page.screenshot({ path: path.join(outDir, 'insights_desktop_light_full.png'), fullPage: true });

  // 2. Dark Mode Desktop (1440x900)
  console.log('Capturing Insights - Dark Mode Desktop...');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'insights_desktop_dark.png'), fullPage: false });
  await page.screenshot({ path: path.join(outDir, 'insights_desktop_dark_full.png'), fullPage: true });

  // 3. Test Apply Recommendation Action & Toast
  console.log('Testing "Apply Recommendation" action...');
  const applyBtn = await page.waitForSelector('button:has-text("Apply Recommendation")');
  if (applyBtn) {
    await applyBtn.click();
    await page.waitForTimeout(1000); // Allow toast and status change
    await page.screenshot({ path: path.join(outDir, 'insights_applied_toast.png'), fullPage: false });
  }

  // 4. Test Filter Tab: "Applied History"
  console.log('Testing "Applied History" filter tab...');
  const appliedTab = await page.waitForSelector('button:has-text("Applied History")');
  if (appliedTab) {
    await appliedTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'insights_applied_history_tab.png'), fullPage: false });
  }

  // Switch back to "All Active"
  const allActiveTab = await page.waitForSelector('button:has-text("All Active")');
  if (allActiveTab) {
    await allActiveTab.click();
    await page.waitForTimeout(300);
  }

  // 5. Tablet Viewport (768x1024)
  console.log('Capturing Insights - Tablet Viewport (768x1024)...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'insights_tablet_light.png'), fullPage: false });

  // 6. Mobile Viewport (390x844 - iPhone 14)
  console.log('Capturing Insights - Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'insights_mobile_light.png'), fullPage: false });

  await browser.close();

  console.log('Verification completed!');
  if (consoleErrors.length > 0) {
    console.log('⚠️ Console errors detected:', consoleErrors);
  } else {
    console.log('✅ Zero console errors detected during verification!');
  }
})();
