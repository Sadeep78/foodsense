const { chromium } = require('playwright');

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
  
  const res = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="User account menu"]');
    const pRole = btn.querySelectorAll('p')[1];
    return {
      scrollWidth: pRole.scrollWidth,
      offsetWidth: pRole.offsetWidth,
      truncated: pRole.scrollWidth > pRole.offsetWidth,
      text: pRole.innerText
    };
  });
  console.log('Current measurements:', res);
  await browser.close();
})();
