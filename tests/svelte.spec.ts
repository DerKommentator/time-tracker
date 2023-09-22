import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

// const browser = await chromium.launch();
// const context = await browser.newContext();
// const page = await context.newPage();
// await page.goto('http://localhost:4173');

// ====================== Test for Svelte ======================

test("screenshot homescreen and check page title", async ({ page }, testInfo) => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('domcontentloaded');
    let screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
    let title = await page.title();
    expect(title).toEqual("TimeTracker");
});
