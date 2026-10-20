const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  const results = [];
  function assert(name, condition, details = '') {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? `(${details})` : ''}`);
  }

  try {
    console.log('\n--- STARTING OVERLAY SUITE VERIFICATION ---\n');

    // 1. Login to application
    await page.goto('http://127.0.0.1:5173/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'manager@foodsense.lk');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://127.0.0.1:5173/');
    assert('Authentication', true, 'Successfully logged in to FoodSense');

    // ----------------------------------------------------
    // TEST SUITE A: MODAL BEHAVIORS & DUAL-EVENT BACKDROP
    // ----------------------------------------------------
    console.log('\n[Suite A] Testing Modal Behaviors, Dual Events, & Stack Manager...');
    await page.goto('http://127.0.0.1:5173/events');
    await page.waitForSelector('text=Schedule Custom Event');

    // Open modal
    await page.click('text=Schedule Custom Event');
    await page.waitForSelector('[role="dialog"]');
    assert('Modal Opens', await page.isVisible('[role="dialog"]'), 'Schedule Custom Local Promotion modal visible');

    // Body scroll lock
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    assert('Scroll Lock Active', bodyOverflow === 'hidden', `body overflow is ${bodyOverflow}`);

    // Click inside modal content should NOT close it
    await page.click('text=Schedule Custom Local Promotion');
    await page.waitForTimeout(200);
    assert('Inside Click Preserves Modal', await page.isVisible('[role="dialog"]'), 'Clicking inside title did not close modal');

    // Mousedown inside, mouseup outside (drag) should NOT close it
    const modalBox = await page.locator('[role="dialog"] > div').boundingBox();
    const startX = modalBox.x + 50;
    const startY = modalBox.y + 50;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(20, 20); // move to backdrop
    await page.mouse.up();
    await page.waitForTimeout(200);
    assert('Drag-Out Mouseup Preserves Modal', await page.isVisible('[role="dialog"]'), 'Mousedown inside & mouseup outside did not close modal');

    // Backdrop click on untouched modal CLOSES it
    await page.mouse.click(20, 20);
    await page.waitForTimeout(300);
    assert('Backdrop Click Closes Untouched Modal', !(await page.isVisible('[role="dialog"]')), 'Modal closed on backdrop click');

    // Scroll lock restored
    const bodyOverflowRestored = await page.evaluate(() => document.body.style.overflow);
    assert('Scroll Lock Restored', bodyOverflowRestored !== 'hidden', `body overflow is "${bodyOverflowRestored}"`);

    // ----------------------------------------------------
    // TEST SUITE B: DIRTY-FORM PROTECTION & STACKED CONFIRM
    // ----------------------------------------------------
    console.log('\n[Suite B] Testing Dirty Form Protection & Stacked Confirmation Dialog...');
    await page.click('text=Schedule Custom Event');
    await page.waitForSelector('[role="dialog"]');

    // Modify a field to make it dirty
    await page.fill('input[placeholder*="Colombo Street Food"]', 'Mega Galle Road Promotion');
    await page.waitForTimeout(100);

    // Try backdrop click while dirty
    await page.mouse.click(20, 20);
    await page.waitForTimeout(250);
    const confirmDialogVisible = await page.isVisible('[role="alertdialog"]');
    assert('Dirty Backdrop Click Triggers Confirm', confirmDialogVisible, 'Alertdialog "Discard unsaved changes?" appeared');

    // Test Stacked Escape on confirm dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    assert('Escape Dismisses Stacked Confirm First', !(await page.isVisible('[role="alertdialog"]')), 'Confirm dialog dismissed');
    assert('Main Modal Remains Open', await page.isVisible('[role="dialog"]'), 'Main modal preserved with entered text');

    // Press Escape again -> confirm prompt reappears
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    assert('Escape on Dirty Modal Reopens Confirm', await page.isVisible('[role="alertdialog"]'));

    // Click "Keep editing"
    await page.click('text=Keep editing');
    await page.waitForTimeout(200);
    assert('Keep Editing Preserves Dirty Data', await page.inputValue('input[placeholder*="Colombo Street Food"]') === 'Mega Galle Road Promotion');

    // Dismiss with "Discard changes"
    await page.mouse.click(20, 20);
    await page.waitForTimeout(200);
    await page.click('text=Discard changes');
    await page.waitForTimeout(300);
    assert('Discard Changes Closes Modal', !(await page.isVisible('[role="dialog"]')), 'Both confirm and modal closed');

    // ----------------------------------------------------
    // TEST SUITE C: FOCUS TRAP & ACCESSIBILITY
    // ----------------------------------------------------
    console.log('\n[Suite C] Testing Focus Trapping & Return Focus...');
    const triggerSelector = 'button:has-text("Schedule Custom Event")';
    await page.click(triggerSelector);
    await page.waitForSelector('[role="dialog"]');

    // Check autofocus
    const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
    assert('Initial Focus Inside Modal', ['INPUT', 'BUTTON'].includes(activeTagName), `Active element is ${activeTagName}`);

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const isInsideAfterTabs = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(document.activeElement);
    });
    assert('Tab Navigation Trapped Inside Modal', isInsideAfterTabs);

    // Close with visible close (X) button
    await page.click('[aria-label="Close"]');
    await page.waitForTimeout(300);
    assert('Close (X) Button Closes Modal', !(await page.isVisible('[role="dialog"]')));

    // ----------------------------------------------------
    // TEST SUITE D: SINGLE ACTIVE POPOVER (HEADER NOTIFICATIONS)
    // ----------------------------------------------------
    console.log('\n[Suite D] Testing Popover Outside Click & Escape...');
    const bellButton = page.locator('button[aria-label="Notification Centre"]');
    await bellButton.click();
    await page.waitForSelector('text=Notification Centre');
    assert('Notification Popover Opens', await page.isVisible('text=Notification Centre'));

    // Clicking inside popover does NOT close it
    await page.click('text=Alert');
    await page.waitForTimeout(150);
    assert('Inside Popover Click Preserves It', await page.isVisible('text=Notification Centre'));

    // Escape closes popover and returns focus to Bell
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    assert('Escape Closes Popover', !(await page.isVisible('text=Notification Centre')));
    const isBellFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Notification Centre');
    assert('Escape Restores Focus to Trigger', isBellFocused);

    // Outside click closes popover
    await bellButton.click();
    await page.waitForSelector('text=Notification Centre');
    await page.mouse.click(200, 200); // click main body
    await page.waitForTimeout(200);
    assert('Outside Click Closes Popover', !(await page.isVisible('text=Notification Centre')));

    // ----------------------------------------------------
    // TEST SUITE E: MOBILE NAVIGATION DRAWER
    // ----------------------------------------------------
    console.log('\n[Suite E] Testing Mobile Navigation Drawer...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    const mobileMenuBtn = page.locator('button[aria-label="Toggle menu"]');
    await mobileMenuBtn.click();
    await page.waitForSelector('[role="dialog"][aria-label="Main Navigation Menu"]');
    assert('Mobile Drawer Opens', await page.isVisible('[role="dialog"][aria-label="Main Navigation Menu"]'));

    // Outside tap closes drawer
    await page.mouse.click(360, 400); // tap right side outside drawer
    await page.waitForTimeout(300);
    assert('Backdrop Tap Closes Mobile Drawer', !(await page.isVisible('[role="dialog"][aria-label="Main Navigation Menu"]')));

    // Escape closes mobile drawer
    await mobileMenuBtn.click();
    await page.waitForSelector('[role="dialog"][aria-label="Main Navigation Menu"]');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert('Escape Closes Mobile Drawer', !(await page.isVisible('[role="dialog"][aria-label="Main Navigation Menu"]')));

    // Link navigation inside drawer closes it
    await mobileMenuBtn.click();
    await page.waitForSelector('[role="dialog"][aria-label="Main Navigation Menu"]');
    await page.locator('[role="dialog"][aria-label="Main Navigation Menu"]').locator('text=Surplus Donations').click();
    await page.waitForURL('**/donations');
    await page.waitForTimeout(300);
    assert('Nav Link Click Closes Drawer & Navigates', !(await page.isVisible('[role="dialog"][aria-label="Main Navigation Menu"]')));

    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // ----------------------------------------------------
    // TEST SUITE F: GUIDED PITCH TOUR MODAL
    // ----------------------------------------------------
    console.log('\n[Suite F] Testing Guided Pitch Tour Exit Confirmation...');
    const tourBtn = page.locator('button:has-text("Pitch Tour")');
    await tourBtn.click();
    await page.waitForSelector('text=University Project Overview');
    assert('Guided Tour Modal Opens', await page.isVisible('text=University Project Overview'));

    // Clicking outside guided tour prompts "Exit tour?"
    await page.mouse.click(20, 20);
    await page.waitForTimeout(250);
    assert('Outside Click Prompts Exit Tour', await page.isVisible('text=Exit guided pitch tour?'));

    // Continue Tour
    await page.click('text=Continue Tour');
    await page.waitForTimeout(200);
    assert('Continue Tour Keeps Tour Open', await page.isVisible('text=University Project Overview'));

    // Exit Tour
    await page.mouse.click(20, 20);
    await page.waitForTimeout(200);
    await page.click('text=Exit Tour');
    await page.waitForTimeout(300);
    assert('Exit Tour Closes Modal', !(await page.isVisible('text=University Project Overview')));

    // ----------------------------------------------------
    // TEST SUITE G: TOAST NOTIFICATION COMPONENT
    // ----------------------------------------------------
    console.log('\n[Suite G] Testing Accessible Toast Notification...');
    const loadSampleBtn = page.locator('button:has-text("Load Sample Data")');
    await loadSampleBtn.click();
    await page.waitForSelector('[role="status"]');
    assert('Toast Banner Appears with role="status"', await page.isVisible('[role="status"]'));

    // Hover pauses timer
    const toastBox = await page.locator('[role="status"]').boundingBox();
    await page.mouse.move(toastBox.x + 20, toastBox.y + 10);
    await page.waitForTimeout(1000);
    assert('Toast Persists During Hover', await page.isVisible('[role="status"]'));

    // Close button dismisses immediately
    await page.click('[role="status"] button[aria-label="Close notification"]');
    await page.waitForTimeout(200);
    assert('Toast Close (X) Button Dismisses Immediately', !(await page.isVisible('[role="status"]')));

    console.log('\n--- ALL TEST SUITES COMPLETED ---');
    const failed = results.filter((r) => !r.passed);
    console.log(`\nTOTAL TESTS: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}\n`);

    if (failed.length > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
