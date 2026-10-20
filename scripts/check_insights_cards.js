const { chromium } = require('playwright');
const path = require('path');

const outDir = path.resolve('docs/screenshots/dashboard_polish');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://127.0.0.1:5173/insights');
  await page.waitForTimeout(1000);

  if (page.url().includes('/login')) {
    await page.fill('input[type="email"]', 'manager@foodsense.lk');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:5173/');
    await page.goto('http://127.0.0.1:5173/insights');
  }

  await page.waitForSelector('text=Smart Operational Insights', { timeout: 15000 });
  await page.waitForTimeout(500);

  // Set Dark Mode first (matching user's screenshot)
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('foodsense_theme', 'dark');
  });
  await page.waitForTimeout(400);
  
  await page.screenshot({ path: path.join(outDir, '13_insights_aligned_dark.png') });
  
  // Set Light Mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('foodsense_theme', 'light');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '15_insights_aligned_light.png') });

  const cardInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div');
    return Array.from(cards).map((c, i) => {
      const s = window.getComputedStyle(c);
      const rect = c.getBoundingClientRect();
      return {
        cardIndex: i,
        padding: s.padding,
        paddingTop: s.paddingTop,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        paddingBottom: s.paddingBottom,
        rect: { width: Math.round(rect.width), height: Math.round(rect.height) }
      };
    });
  });
  
  console.log('Cards styling and padding:');
  console.log(JSON.stringify(cardInfo, null, 2));
  
  await browser.close();
})();
