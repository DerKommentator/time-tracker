import { test, expect } from '@playwright/test';
import { parseElectronApp } from './electronHelper';
import { formatDate, formatDateToTime } from '../../src/lib/utils/HelperFunctions';
import { type ElectronApplication, type Page, _electron as electron } from 'playwright'

let electronApp: ElectronApplication;
let page: Page;
// let bwHandle: JSHandle<Electron.BrowserWindow>;

// let appWindow: Page;
// let appInfo: ElectronAppInfo;

let now: Date = new Date();

function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

test.describe("Test E2E Electron App", async () => {
    test.beforeAll(async () => {
        // find the latest build in the out directory
        const winPath = "./dist/win-unpacked/TimeTracker.exe";
        const linuxPath = "./dist/linux-unpacked/timetracker";
        const platformPath = process.platform === "win32" ? winPath : linuxPath;
        //const latestBuild = findLatestBuild(platformPath);
        // parse the directory and find paths and other info
        const appInfo = parseElectronApp(platformPath);
        // set the CI environment variable to true
        process.env.CI = 'e2e'
        electronApp = await electron.launch({
            args: [appInfo.main],
            executablePath: appInfo.executable
        });

        electronApp.on('window', async (page) => {
            const filename = page.url()?.split('/').pop();
            console.log(`Window opened: ${filename}`);

            // capture errors
            page.on('pageerror', (error) => {
                console.error(error);
            });
            // capture console messages
            page.on('console', (msg) => {
                console.log(msg.text());
            });
        })

    })

    test.afterAll(async () => {
        await page.screenshot({ path: 'screenshots/final-screen.png' });

        // Workaround: Goto Settings and delete data
        await page.getByTestId("layout-settings-link").click();
        await page.getByTestId("settings-del-all-data-btn").click();
        const modal = page.getByTestId("modal")
        const delBtn = modal.locator(".variant-filled-error").first();
        await delBtn.click();

        await page.context().close();
        await page.close();
        await electronApp.close();
    })

    test('check if window is visible', async () => {
        page = await electronApp.firstWindow()
        const bwHandle = await electronApp.browserWindow(page);

        // const visible = await bwHandle.evaluate((win) => win.isVisible());
        const devToolsOpened = await bwHandle.evaluate((win) => win.webContents.isDevToolsOpened());
        const crashed = await bwHandle.evaluate((win) => win.webContents.isCrashed());

        // expect(visible).toBeTruthy();
        expect(devToolsOpened).toBeFalsy();
        expect(crashed).toBeFalsy();
    });

    test("add timeslot", async () => {
        page = await electronApp.firstWindow()
        const tomorrow = addDays(now, 1);
        const dateString: string = tomorrow.toISOString().split('T')[0];
        const endTime = addMinutes(now, 30);

        const datepicker = page.getByTestId("timeslot-datepicker");
        expect(datepicker).toBeTruthy();
        await datepicker.clear();
        await datepicker.fill(dateString);
        await expect(datepicker).toHaveValue(dateString);

        const startInput = page.getByTestId("start-time-input");
        expect(startInput).toBeTruthy();
        await startInput.fill("07:30");
        await expect(startInput).toHaveValue("07:30");

        const endInput = page.getByTestId("end-time-input");
        expect(endInput).toBeTruthy();
        await endInput.fill(formatDateToTime(endTime));
        await expect(endInput).toHaveValue(formatDateToTime(endTime));

        let saveBtn = page.getByTestId("timeslot-save-btn");
        expect(saveBtn).toBeTruthy();
        await saveBtn.click();

        page.waitForTimeout(1000);

        const newTimeslot = page.getByTestId("timeslot-item-card-date").getByText(formatDate(tomorrow));
        await expect(newTimeslot).toHaveText(formatDate(tomorrow));
        await expect(newTimeslot).toBeVisible();

        const timeslotStartTime = page.getByTestId("timeslot-item-card-start-time");
        const timeslotEndTime = page.getByTestId("timeslot-item-card-end-time");

        // await expect(timeslotStartTime).toBeVisible();
        await expect(timeslotStartTime).toHaveValue("07:30");
        await expect(timeslotEndTime).toHaveValue(formatDateToTime(endTime));
    });
});