const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.url().includes(':8000')) {
      console.log('HTTP RESP:', res.status(), res.url());
    }
  });

  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'manager@foodsense.lk');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://127.0.0.1:5173/');
  await page.waitForTimeout(3000);

  const kpis = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('foodsense_token');
      const res = await fetch('http://localhost:8000/kpis?days_range=90', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      return { status: res.status, cards: json.cards?.length, data: json };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('Direct fetch result from page:', JSON.stringify(kpis, null, 2).slice(0, 300));
  
  await browser.close();
})();
