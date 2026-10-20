const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('docs/screenshots/dashboard_polish');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('🚀 Running Dashboard Polish Pass Verification...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

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

  // Wait for data load
  console.log('Waiting for Dashboard data...');
  await page.waitForSelector('[title="Food Waste Percentage"]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // 1. Desktop 1440px - Light & Dark
  console.log('Capturing Desktop (1440x900) Light & Dark...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '01_dashboard_1440_light.png'), fullPage: false });

  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '02_dashboard_1440_dark.png'), fullPage: false });

  // 2. Desktop 1280px - Check horizontal overflow & capture
  console.log('Testing Desktop 1280px viewport...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(400);
  const overflow1280 = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('1280px Horizontal Overflow Detected:', overflow1280 ? '❌ YES' : '✅ NO');
  await page.screenshot({ path: path.join(outDir, '03_dashboard_1280_light.png'), fullPage: false });

  // 3. Tablet 768px - Check horizontal overflow & capture
  console.log('Testing Tablet 768px viewport...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(400);
  const overflow768 = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('768px Horizontal Overflow Detected:', overflow768 ? '❌ YES' : '✅ NO');
  await page.screenshot({ path: path.join(outDir, '04_dashboard_768_light.png'), fullPage: false });

  // 4. Mobile 390px
  console.log('Testing Mobile 390px viewport...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '05_dashboard_390_light.png'), fullPage: false });

  // 5. Detailed KPI Cards Inspection (1440px)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  const kpiAudit = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.grid > div.relative.flex.flex-col.justify-between')).slice(0, 6);
    return cards.map((card, idx) => {
      const titleSpan = card.querySelector('span[title]');
      const valueDiv = card.querySelector('.my-auto');
      const sparklineDiv = card.querySelector('svg');
      const footerDiv = card.querySelector('.border-t');

      const cardRect = card.getBoundingClientRect();
      const sparklineRect = sparklineDiv ? sparklineDiv.getBoundingClientRect() : null;

      // Sparkline overflow check
      let sparklineOverflow = false;
      if (sparklineRect) {
        sparklineOverflow = sparklineRect.right > cardRect.right || sparklineRect.left < cardRect.left;
      }

      return {
        index: idx,
        title: titleSpan ? titleSpan.innerText : '',
        valueText: valueDiv ? valueDiv.innerText.replace(/\n/g, ' ') : '',
        cardHeight: cardRect.height,
        sparklinePresent: !!sparklineDiv,
        sparklineOverflow,
        footerText: footerDiv ? footerDiv.innerText.replace(/\n/g, ' ') : '',
      };
    });
  });

  console.log('\n📊 KPI Cards Audit Results:');
  console.table(kpiAudit);

  // 6. Test Sidebar Profile in 1440px
  console.log('\nTesting Sidebar Profile Menu...');
  const profileButton = await page.waitForSelector('button[aria-label="User account menu"]');
  if (profileButton) {
    await profileButton.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, '06_sidebar_profile_popover.png'), fullPage: false });
    await page.keyboard.press('Escape');
  }

  await browser.close();

  console.log('Verification completed!');
  if (consoleErrors.length > 0) {
    console.log('⚠️ Console errors detected:', consoleErrors);
  } else {
    console.log('✅ Zero console errors detected during verification!');
  }
})();
