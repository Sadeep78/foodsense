const { chromium } = require('playwright');
const path = require('path');

const outDir = path.resolve('docs/screenshots/dashboard_polish');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'manager@foodsense.lk');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForSelector('button[aria-label="User account menu"]');
  
  // 1. Light Mode Profile Button Close-up
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(300);
  
  const profileBtn = await page.$('button[aria-label="User account menu"]');
  await profileBtn.screenshot({ path: path.join(outDir, '07_profile_aligned_light.png') });
  
  const aside = await page.$('aside');
  await aside.screenshot({ path: path.join(outDir, '08_sidebar_aligned_light.png') });

  // Click to open popover in light mode
  await profileBtn.click();
  await page.waitForTimeout(300);
  await aside.screenshot({ path: path.join(outDir, '09_sidebar_popover_open_light.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // 2. Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(300);
  
  await profileBtn.screenshot({ path: path.join(outDir, '10_profile_aligned_dark.png') });
  await aside.screenshot({ path: path.join(outDir, '11_sidebar_aligned_dark.png') });

  await profileBtn.click();
  await page.waitForTimeout(300);
  await aside.screenshot({ path: path.join(outDir, '12_sidebar_popover_open_dark.png') });
  
  await browser.close();
  console.log('Profile alignment screenshots captured successfully!');
})();
