const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('docs/screenshots/dashboard_redesign');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('🚀 Running Comprehensive Dashboard Redesign Verification...');
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

  // Wait specifically for KPI card to appear (data loaded)
  console.log('Waiting for Dashboard data to load...');
  await page.waitForSelector('[title="Food Waste Percentage"]', { timeout: 15000 });
  await page.waitForTimeout(1500); // Allow animations & charts to settle

  // 1. Dashboard Light Mode
  console.log('Capturing Dashboard - Light Mode (Desktop 1440x900)...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'dashboard_desktop_light.png'), fullPage: false });
  await page.screenshot({ path: path.join(outDir, 'dashboard_desktop_light_full.png'), fullPage: true });

  // 2. Dashboard Dark Mode
  console.log('Capturing Dashboard - Dark Mode (Desktop 1440x900)...');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'dashboard_desktop_dark.png'), fullPage: false });
  await page.screenshot({ path: path.join(outDir, 'dashboard_desktop_dark_full.png'), fullPage: true });

  // 3. Test Sidebar User Profile Dropdown Popover
  console.log('Testing User Profile Popover in Dark Mode...');
  const profileButton = await page.waitForSelector('button[aria-label="User account menu"]', { timeout: 3000 });
  if (profileButton) {
    await profileButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'dashboard_profile_dropdown.png'), fullPage: false });
    // Press Escape to close popover
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 4. Test "How It Works" toggle
  console.log('Testing "How It Works" expand/collapse...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(400);
  const howItWorksToggle = await page.$('button[aria-label="View how it works guide steps"]');
  if (howItWorksToggle) {
    await howItWorksToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'dashboard_how_it_works_expanded.png'), fullPage: false });
    const collapseBtn = await page.$('button[aria-label="Collapse how it works guide"]');
    if (collapseBtn) await collapseBtn.click();
    await page.waitForTimeout(300);
  }

  // 4b. Test Command Palette (Ctrl+K)
  console.log('Testing Command Palette Search Modal (⌘K)...');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dashboard_command_palette.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 5. Tablet Viewport (768x1024)
  console.log('Capturing Dashboard - Tablet Viewport (768x1024)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'dashboard_tablet_light.png'), fullPage: false });

  // 6. Mobile Viewport (390x844 - iPhone 14)
  console.log('Capturing Dashboard - Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'dashboard_mobile_light.png'), fullPage: false });

  await browser.close();

  console.log('Verification completed!');
  if (consoleErrors.length > 0) {
    console.log('⚠️ Console errors detected:', consoleErrors);
  } else {
    console.log('✅ Zero console errors detected during verification!');
  }
})();
