import { test, expect, type JSHandle } from '@playwright/test';
import { parseElectronApp } from './electronHelper';
import { formatDate, formatDateToTime } from '../../src/lib/utils/HelperFunctions';
import { type ElectronApplication, type Page, _electron as electron } from 'playwright'
import type { BrowserWindow } from 'electron';

let electronApp: ElectronApplication;
// let page: Page;
// let bwHandle: JSHandle<Electron.BrowserWindow>;

// let appWindow: Page;
// let appInfo: ElectronAppInfo;

function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

async function deleteAllData(page: Page) {
    await page.goto("app://-/settings");
    await page.getByTestId("settings-del-all-data-btn").click();
    const modal = page.getByTestId("modal")
    const delBtn = modal.locator(".variant-filled-error").first();
    await delBtn.click();
}

test.describe("Test E2E Electron App", async () => {
    test.beforeAll(async () => {
        const winPath = "./dist/win-unpacked/TimeTracker.exe";
        const linuxPath = "./dist/linux-unpacked/timetracker";
        const platformPath = process.platform === "win32" ? winPath : linuxPath;
        // parse the directory and find paths and other info
        const appInfo = parseElectronApp(platformPath);
        // set the CI environment variable to true
        process.env.CI = "true";

        // videos takes to much time on github actions
        electronApp = await electron.launch({
            args: [appInfo.main],
            executablePath: appInfo.executable
        });
        const page = await electronApp.firstWindow();
        // const bwHandle = await electronApp.browserWindow(page);
        // await bwHandle.evaluate((win: BrowserWindow) => win.maximize());

        // Workaround: Goto Settings and delete data
        // await deleteAllData(page);
    });

    test.afterAll(async () => {
        const page = await electronApp.firstWindow();

        if (!process.env.CI) {
            await page.screenshot({ path: 'screenshots/final-screen.png' });
        }
        await deleteAllData(page);

        await page.context().close();
        await page.close();
        await electronApp.close();
    });

    test('check if window is visible', async () => {
        const page = await electronApp.firstWindow();
        if (!process.env.CI) {
            await page.screenshot({ path: 'screenshots/init-screen.png' });
        }
        const bwHandle = await electronApp.browserWindow(page);

        // const visible = await bwHandle.evaluate((win) => win.isVisible());
        const devToolsOpened = await bwHandle.evaluate((win) => win.webContents.isDevToolsOpened());
        const crashed = await bwHandle.evaluate((win) => win.webContents.isCrashed());

        // expect(visible).toBeTruthy();
        expect(devToolsOpened).toBeFalsy();
        expect(crashed).toBeFalsy();
    });

    async function addTimeslotAndTest(page: Page, date: Date, startTime: {hour: number, min: number}, endTime: {hour: number, min: number}) {
        let returnValues: {start: Date, end: Date} = {start: date, end: date};
        
        const start = new Date();
        start.setHours(startTime.hour, startTime.min);
        returnValues.start = start;
        const offset = date.getTimezoneOffset();
        date = new Date(date.getTime() - (offset * 60 * 1000));
        const dateString: string = date.toISOString().split('T')[0];

        const datepicker = page.getByTestId("timeslot-datepicker");
        expect(datepicker).toBeTruthy();
        // await datepicker.clear();
        await datepicker.fill(dateString);
        await expect(datepicker).toHaveValue(dateString);

        const startInput = page.getByTestId("start-time-input");
        expect(startInput).toBeTruthy();
        await startInput.fill(formatDateToTime(start));
        await expect(startInput).toHaveValue(formatDateToTime(start));

        const end = new Date();
        end.setHours(endTime.hour, endTime.min);
        returnValues.end = end;
        const endInput = page.getByTestId("end-time-input");
        expect(endInput).toBeTruthy();
        await endInput.fill(formatDateToTime(end));
        await expect(endInput).toHaveValue(formatDateToTime(end));

        let saveBtn = page.getByTestId("timeslot-save-btn");
        expect(saveBtn).toBeTruthy();
        await saveBtn.click();

        return returnValues;
    }

    // Home
    test("add timeslot", async () => {
        const page = await electronApp.firstWindow();

        let now: Date = new Date();
        // page.waitForTimeout(1000);
        const times = await addTimeslotAndTest(page, now, {hour: 7, min: 30}, {hour: 15, min: 50});

        const newTimeslot = page.getByTestId("timeslot-item-card-date");
        await expect(newTimeslot).toBeVisible();
        await expect(newTimeslot).toHaveText(formatDate(now));

        const timeslotStartTime = page.getByTestId("timeslot-item-card-start-time");
        const timeslotEndTime = page.getByTestId("timeslot-item-card-end-time");

        // await expect(timeslotStartTime).toBeVisible();
        await expect(timeslotStartTime).toHaveValue(formatDateToTime(times.start));
        await expect(timeslotEndTime).toHaveValue(formatDateToTime(times.end));

        const delBtn = page.getByTestId("timeslot-delete-btn");
        await expect(delBtn).toBeVisible();
        await delBtn.click();
    });

    // Statistics
    test("check calculations in statistics", async () => {
        const page = await electronApp.firstWindow();
        let date = new Date();

        // Add data for test
        await addTimeslotAndTest(page, date, {hour: 7, min: 0}, {hour: 15, min: 50});
        await addTimeslotAndTest(page, addDays(date, 1), {hour: 7, min: 45}, {hour: 15, min: 30});
        await addTimeslotAndTest(page, addDays(date, 2), {hour: 8, min: 10}, {hour: 16, min: 50});

        // await page.screenshot({ path: "screenshots/stats.png", fullPage: true });

        await page.goto("app://-/statistics");
        const startTimeAvg = page.getByTestId("start-avg-card").getByTestId("displayText");
        const endTimeAvg = page.getByTestId("end-avg-card").getByTestId("displayText");
        const startTimeMedian = page.getByTestId("start-median-card").getByTestId("displayText");
        const endTimeMedian = page.getByTestId("end-median-card").getByTestId("displayText");
        const availableOvertime = page.getByTestId("aval-ot-card").getByTestId("displayText");

        await expect(startTimeAvg).toHaveText("07:38");
        await expect(endTimeAvg).toHaveText("16:04");
        await expect(startTimeMedian).toHaveText("07:45");
        await expect(endTimeMedian).toHaveText("15:50");
        await expect(availableOvertime).toHaveText("02:45");

        // await deleteAllData(page);
    });

    // Settings
    test("change language", async () => {
        const page = await electronApp.firstWindow();

        await page.goto("app://-/settings");
        const langSelect = page.getByTestId("settings-lang-select");
        await langSelect.selectOption("English");

        const saveBtn = page.getByTestId("settings-save-btn");
        await saveBtn.click();

        const settingsLabel = page.getByTestId("settings-label");
        await expect(settingsLabel).toHaveText("Settings");

        await langSelect.selectOption("Deutsch");
        await saveBtn.click();
        await expect(settingsLabel).toHaveText("Einstellungen");
    });
});