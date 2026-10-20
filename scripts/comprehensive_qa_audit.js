const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runAudit() {
  console.log('================================================================');
  console.log(' STARTING COMPREHENSIVE PLAYWRIGHT QA & SCREENSHOT REGENERATION');
  console.log('================================================================');

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
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  const baseUrl = 'http://127.0.0.1:5173';

  try {
    // 1. Login Page
    console.log('[QA] 1. Auditing Login Page (/login)...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01_login.png') });

    // Perform Login
    console.log('[QA] Logging in as Store Manager (manager@foodsense.lk)...');
    await page.click('button:has-text("Store Manager")');
    await page.waitForURL(`${baseUrl}/`, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // 2. Executive Dashboard (Desktop 1440x900)
    console.log('[QA] 2. Auditing Executive Dashboard (/)...');
    await page.waitForSelector('text=Total Cost of Waste', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png') });

    // 3. Demand Forecasts Page & Explainability Modal
    console.log('[QA] 3. Auditing Demand Forecasts (/forecasts)...');
    await page.goto(`${baseUrl}/forecasts`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Holt-Winters', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '04_forecasts.png') });

    // Open Explainability modal
    const explainBtn = page.locator('button:has-text("Explainability"), button:has-text("Decomposition")').first();
    if (await explainBtn.isVisible()) {
      await explainBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, '22_forecast_explainability_modal.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // 4. Replenishment Recommendations Page
    console.log('[QA] 4. Auditing Replenishment Orders (/recommendations)...');
    await page.goto(`${baseUrl}/recommendations`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '05_recommendations.png') });

    // 5. Expiry Risk Alerts & Salvage Modal
    console.log('[QA] 5. Auditing Expiry Alerts (/alerts)...');
    await page.goto(`${baseUrl}/alerts`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '06_alerts.png') });

    const salvageBtn = page.locator('button:has-text("Salvage Discount"), button:has-text("Discount")').first();
    if (await salvageBtn.isVisible()) {
      await salvageBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, '14_dynamic_markdown_suggestions.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // 6. Waste Reports & What-If Simulator
    console.log('[QA] 6. Auditing Waste Reports & What-If Simulator (/reports)...');
    await page.goto(`${baseUrl}/reports`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '07_reports_what_if.png') });

    // 7. Smart Insights Engine
    console.log('[QA] 7. Auditing Smart Insights (/insights)...');
    await page.goto(`${baseUrl}/insights`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '12_smart_insights_page.png') });

    // 8. Weather & Events Calendar
    console.log('[QA] 8. Auditing Weather & Events Calendar (/events)...');
    await page.goto(`${baseUrl}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '20_weather_and_events_calendar.png') });

    // 9. Surplus Donations Tracker
    console.log('[QA] 9. Auditing Food Donations (/donations)...');
    await page.goto(`${baseUrl}/donations`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '15_food_donations_page.png') });

    // 10. Sustainability & Impact Scorecard
    console.log('[QA] 10. Auditing Sustainability Scorecard (/sustainability)...');
    await page.goto(`${baseUrl}/sustainability`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '23_sustainability_scorecard.png') });

    // 11. Waste Goals & Progress Rings
    console.log('[QA] 11. Auditing Waste Goals (/goals)...');
    await page.goto(`${baseUrl}/goals`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '17_waste_goals_page.png') });

    // 12. Profit & Margins 4-Quadrant Scatter
    console.log('[QA] 12. Auditing Profit & Margins (/margins)...');
    await page.goto(`${baseUrl}/margins`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '19_profit_margins_quadrant.png') });

    // 13. Multi-Outlet Leaderboard
    console.log('[QA] 13. Auditing Multi-Outlet Support (/outlets)...');
    await page.goto(`${baseUrl}/outlets`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '26_outlets_leaderboard.png') });

    // 14. Supplier Network & Price History
    console.log('[QA] 14. Auditing Suppliers (/suppliers)...');
    await page.goto(`${baseUrl}/suppliers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '27_supplier_price_trajectory.png') });

    // 15. Recipe BOM Explosion
    console.log('[QA] 15. Auditing Recipe BOM (/recipes)...');
    await page.goto(`${baseUrl}/recipes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '28_recipe_ingredient_explosion.png') });

    // 16. Touch-Friendly Quick Waste Log
    console.log('[QA] 16. Auditing Quick Waste Log Station (/quick-log)...');
    await page.goto(`${baseUrl}/quick-log`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '29_quick_waste_logging.png') });

    // 17. Data Upload & Validation Preview
    console.log('[QA] 17. Auditing Data Upload (/upload)...');
    await page.goto(`${baseUrl}/upload`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '03_upload_valid_preview.png') });

    // 18. Settings Page
    console.log('[QA] 18. Auditing Settings (/settings)...');
    await page.goto(`${baseUrl}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '08_settings.png') });

    // 19. Notification Centre Drawer
    console.log('[QA] 19. Auditing Notification Centre Drawer...');
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    const bellBtn = page.locator('button[title="Notification Centre"]');
    await bellBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, '24_notifications_center.png') });
    await bellBtn.click(); // close

    // 20. Trilingual UI: Sinhala
    console.log('[QA] 20. Auditing Sinhala Localization...');
    const langSelect = page.locator('select[aria-label="Language Selector"]');
    await langSelect.selectOption('si');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, '30_multilanguage_sinhala.png') });

    // 21. Trilingual UI: Tamil
    console.log('[QA] 21. Auditing Tamil Localization...');
    await langSelect.selectOption('ta');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, '31_multilanguage_tamil.png') });

    // Revert back to English
    await langSelect.selectOption('en');
    await page.waitForTimeout(300);

    // 22. Guided Pitch Tour Modal
    console.log('[QA] 22. Auditing Guided Pitch Tour Modal...');
    const tourBtn = page.locator('button:has-text("Pitch Tour")');
    await tourBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, '32_guided_pitch_tour.png') });
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Close Tour"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    // 23. Dark Mode Dashboard
    console.log('[QA] 23. Auditing Dark Mode Dashboard...');
    const themeBtn = page.locator('button[title="Switch to Dark Mode"], button[title="Switch to Light Mode"]');
    await themeBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, '09_dark_mode_dashboard.png') });
    await themeBtn.click(); // Revert to light mode

    // 24. Responsive Viewports: Tablet (768x1024)
    console.log('[QA] 24. Auditing Tablet Viewport (768x1024) on /margins...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${baseUrl}/margins`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '34_responsive_tablet_margins.png') });

    // 25. Responsive Viewports: Mobile (390x844)
    console.log('[QA] 25. Auditing Mobile Viewport (390x844) on / ...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '33_responsive_mobile_dashboard.png') });

    console.log('================================================================');
    console.log(` AUDIT COMPLETE! Total console errors caught: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.warn('Console warnings/errors:', consoleErrors);
    } else {
      console.log(' ZERO console errors or unhandled exceptions across all pages!');
    }
    console.log('================================================================');
  } catch (err) {
    console.error('Audit failed with error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
