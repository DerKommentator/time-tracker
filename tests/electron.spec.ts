import type { ElectronApplication, Page, JSHandle } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { startApp, type ElectronAppInfo } from './electronHelpers';

let electronApp: ElectronApplication;
let page: Page;
let bwHandle: JSHandle<Electron.BrowserWindow>;

let appWindow: Page;
let appInfo: ElectronAppInfo;

test.beforeAll(async () => {
    const startAppResponse = await startApp();
    appWindow = startAppResponse.appWindow;
    appInfo = startAppResponse.appInfo;
    electronApp = startAppResponse.electronApp;
    page = await electronApp.firstWindow();
});


test('check if window is visible', async () => {
    bwHandle = await electronApp.browserWindow(page);
    const visible = await bwHandle.evaluate((win) => win.isVisible());
    const devToolsOpened = await bwHandle.evaluate((win) => win.webContents.isDevToolsOpened());
    const crashed = await bwHandle.evaluate((win) => win.webContents.isCrashed());

    expect(visible).toBeTruthy();
    expect(devToolsOpened).toBeFalsy();
    expect(crashed).toBeFalsy();

    // Exit app.
    // await electronApp.close();
});

test.afterAll(async () => {
    await appWindow.screenshot({ path: 'screenshots/final-screen.png' });
    await appWindow.context().close();
    await appWindow.close();
    await electronApp.close();
});

// test.beforeAll(async () => {
//     electronApp = await electron.launch({
//         args: ["electron/main.cjs"]
//     });
//     page = await electronApp.firstWindow();
// });

// test("check if window is visible", async () => {
//     bwHandle = await electronApp.browserWindow(page);
//     await bwHandle.evaluate((win) => win.removeAllListeners("before-quit"));
//     const visible = await bwHandle.evaluate((win) => win.isVisible());
//     const devToolsOpened = await bwHandle.evaluate((win) => win.webContents.isDevToolsOpened());
//     const crashed = await bwHandle.evaluate((win) => win.webContents.isCrashed());

//     expect(visible).toBeTruthy();
//     expect(devToolsOpened).toBeFalsy();
//     expect(crashed).toBeFalsy();
// });

// test.afterAll(async () => {
//     await electronApp.close();
// });


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