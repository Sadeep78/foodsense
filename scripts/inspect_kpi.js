const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'manager@foodsense.lk');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[title="Food Waste Percentage"]');
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('span[title]')).map(span => {
      const computed = window.getComputedStyle(span);
      return {
        titleAttr: span.getAttribute('title'),
        innerText: span.innerText,
        className: span.className,
        computedHeight: computed.height,
        lineClamp: computed.webkitLineClamp || computed.lineClamp,
        maxHeight: computed.maxHeight,
        overflow: computed.overflow,
        display: computed.display,
      };
    });
  });
  console.log(JSON.stringify(titles, null, 2));
  await browser.close();
})();
