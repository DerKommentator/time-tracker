import { _electron } from '@playwright/test';
import { test, expect } from '@playwright/test';

test('launch app', async () => {
  const electronApp = await _electron.launch({ args: ['electron/main.cjs'] });
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged;
  })

  expect(isPackaged).toBe(false);

  const window = await electronApp.firstWindow();
  await window.screenshot({ path: "intro.png" });

  await electronApp.close();
});