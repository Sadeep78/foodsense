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
  
  await page.waitForSelector('aside', { timeout: 10000 });
  const aside = await page.$('aside');
  const box = await aside.boundingBox();
  console.log('aside boundingBox:', box);
  
  const buttons = await page.$$('button[aria-label="User account menu"]');
  console.log('Number of user account menu buttons found:', buttons.length);
  for (let i = 0; i < buttons.length; i++) {
    const bBox = await buttons[i].boundingBox();
    const isVisible = await buttons[i].isVisible();
    const text = await buttons[i].innerText();
    console.log('Button', i, 'visible:', isVisible, 'box:', bBox, 'text:', text.replace(/\n/g, ' '));
  }
  await browser.close();
})();
