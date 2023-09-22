import { _electron, type ElectronApplication, type Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

// TODO: Tests for electron (env variable APP_DEV must be true)

// test.describe.configure({ mode: 'serial' });

// let window: Page;
// let electronApp: ElectronApplication;

// test('launch app', async () => {
//   electronApp = await _electron.launch({ args: ['electron/main.cjs'] });
//   const isPackaged = await electronApp.evaluate(async ({ app }) => {
//     // This runs in Electron's main process, parameter here is always
//     // the result of the require('electron') in the main app script.
//     return app.isPackaged;
//   })

//   expect(isPackaged).toBe(false);

//   window = await electronApp.firstWindow();
//   await window.waitForSelector('#appShell', {
//     timeout: 30000
//   });
//   await window.screenshot({ path: 'playwright-report/screenshots/out.png' });
// });

// test('window has correct title', async () => {
//   const title = await window.title()
//   expect(title).toBe('TimeTracker')
// })

// test.afterAll(async () => {
//   // Exit app.
//   await electronApp.close();
// });