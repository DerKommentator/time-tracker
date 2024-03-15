import { test, expect, type JSHandle } from '@playwright/test';
import { parseElectronApp } from './electronHelper';
import { formatDate, formatDateToTime, formatTime, formatTimeWithLabels } from '../../src/lib/utils/HelperFunctions';
import { type ElectronApplication, type Page, _electron as electron } from 'playwright';
import type { BrowserWindow } from 'electron';
import type { Time } from '$lib/models/Time';
import path from 'path';

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
	await page.goto('app://-/settings');
	await page.getByTestId('settings-del-all-data-btn').click();
	const modal = page.getByTestId('modal');
	const delBtn = modal.locator('.variant-filled-error').first();
	await delBtn.click();
}

test.describe('Test E2E Electron App', async () => {
	test.beforeAll(async () => {
		const winPath = './dist/win-unpacked/TimeTracker.exe';
		const linuxPath = './dist/linux-unpacked/timetracker';
		const platformPath = process.platform === 'win32' ? winPath : linuxPath;
		// parse the directory and find paths and other info
		const appInfo = parseElectronApp(platformPath);
		// set the CI environment variable to true
		process.env.CI = 'true';

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

	async function addTimeslotAndTest(
		page: Page,
		date: Date,
		startTime: Time,
		breaktimePeriod: Time,
		endTime: Time
	) {
		let returnValues: { start: Date; breaktime: Time, end: Date } = { start: date, breaktime: breaktimePeriod, end: date };

		const start = new Date();
		start.setHours(startTime.hours, startTime.minutes);
		returnValues.start = start;
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);
		const dateString: string = date.toISOString().split('T')[0];

		const datepicker = page.getByTestId('timeslot-datepicker');
		expect(datepicker).toBeTruthy();
		// await datepicker.clear();
		await datepicker.fill(dateString);
		await expect(datepicker).toHaveValue(dateString);

		const startInput = page.getByTestId('start-time-input');
		expect(startInput).toBeTruthy();
		await startInput.fill(formatDateToTime(start));
		await expect(startInput).toHaveValue(formatDateToTime(start));

		const breaktimeInput = page.getByTestId('breaktime-input');
		expect(breaktimeInput).toBeTruthy();
		await breaktimeInput.fill(formatTime(breaktimePeriod));
		await expect(breaktimeInput).toHaveValue(formatTime(breaktimePeriod));
		// returnValues.breaktime = breaktimePeriod;

		const end = new Date();
		end.setHours(endTime.hours, endTime.minutes);
		returnValues.end = end;
		const endInput = page.getByTestId('end-time-input');
		expect(endInput).toBeTruthy();
		await endInput.fill(formatDateToTime(end));
		await expect(endInput).toHaveValue(formatDateToTime(end));

		let saveBtn = page.getByTestId('timeslot-save-btn');
		expect(saveBtn).toBeTruthy();
		await saveBtn.click();

		return returnValues;
	}

	// Home
	test('add timeslot', async () => {
		const page = await electronApp.firstWindow();

		let now: Date = new Date();
		// page.waitForTimeout(1000);
		const times = await addTimeslotAndTest(page, now, { hours: 7, minutes: 30 }, { hours: 0, minutes: 30 }, { hours: 15, minutes: 50 });

		const newTimeslot = page.getByTestId('timeslot-item-card-date');
		await expect(newTimeslot).toBeVisible();
		await expect(newTimeslot).toHaveText(formatDate(now));

		const timeslotStartTime = page.getByTestId('timeslot-item-card-start-time');
		const timeslotBreaktime = page.getByTestId('timeslot-item-card-breaktime');
		const timeslotEndTime = page.getByTestId('timeslot-item-card-end-time');

		// await expect(timeslotStartTime).toBeVisible();
		await expect(timeslotStartTime).toHaveValue(formatDateToTime(times.start));
		await expect(timeslotBreaktime).toContainText(formatTimeWithLabels(times.breaktime, "h", "min"));
		await expect(timeslotEndTime).toHaveValue(formatDateToTime(times.end));

		const delBtn = page.getByTestId('timeslot-delete-btn');
		await expect(delBtn).toBeVisible();
		await delBtn.click();
	});

	// Statistics
	test('check calculations in statistics', async () => {
		const page = await electronApp.firstWindow();
		let date = new Date();

		// Add data for test
		await addTimeslotAndTest(page, date, { hours: 7, minutes: 0 }, { hours: 0, minutes: 20 }, { hours: 15, minutes: 50 });
		await addTimeslotAndTest(page, addDays(date, 1), { hours: 7, minutes: 45 }, { hours: 0, minutes: 30 }, { hours: 15, minutes: 30 });
		await addTimeslotAndTest(page, addDays(date, 2), { hours: 8, minutes: 10 }, { hours: 0, minutes: 40 }, { hours: 16, minutes: 50 });

		// await page.screenshot({ path: "screenshots/stats.png", fullPage: true });

		await page.goto('app://-/statistics');

		const startTimeAvg = page.getByTestId('start-avg-card').getByTestId('displayText');
		await expect(startTimeAvg).toHaveText('07:38');

		const breaktimeAvg = page.getByTestId('breaktime-avg-card').getByTestId('displayText');
		await expect(breaktimeAvg).toHaveText('00:30');

		const endTimeAvg = page.getByTestId('end-avg-card').getByTestId('displayText');
		await expect(endTimeAvg).toHaveText('16:04');

		const startTimeMedian = page.getByTestId('start-median-card').getByTestId('displayText');
		await expect(startTimeMedian).toHaveText('07:45');

		const breaktimeMedian = page.getByTestId('breaktime-median-card').getByTestId('displayText');
		await expect(breaktimeMedian).toHaveText('00:30');

		const endTimeMedian = page.getByTestId('end-median-card').getByTestId('displayText');
		await expect(endTimeMedian).toHaveText('15:50');

		const availableOvertime = page.getByTestId('aval-ot-card').getByTestId('displayText');
		await expect(availableOvertime).toHaveText('01:15');

		// await deleteAllData(page);
	});

	// Settings
	test('change language', async () => {
		const page = await electronApp.firstWindow();

		await page.goto('app://-/settings');
		const langSelect = page.getByTestId('settings-lang-select');
		await langSelect.selectOption('English');

		const saveBtn = page.getByTestId('settings-save-btn');
		await saveBtn.click();

		const settingsLabel = page.getByTestId('settings-label');
		await expect(settingsLabel).toHaveText('Settings');

		await langSelect.selectOption('Deutsch');
		await saveBtn.click();
		await expect(settingsLabel).toHaveText('Einstellungen');

		// Export Select
		const exportSelect = page.getByTestId('export-filetype-select');
		await exportSelect.selectOption('csv');
		await expect(exportSelect).toContainText('CSV');
		await exportSelect.selectOption('json');
		await expect(exportSelect).toContainText('JSON');
		await exportSelect.selectOption('dbb');
		await expect(exportSelect).toContainText('Database Backup');

		// Export Button
		const exportBtn = page.getByTestId('export-data-btn');
		await expect(exportBtn).toBeTruthy();
		// const filePath = path.join('resources', 'timetracker-export.csv');
		// await electronApp.evaluate(async ({ dialog }, filePath) => {
		// 	dialog.showSaveDialog = () => Promise.resolve({ filePath: filePath, canceled: false });
		// }, filePath);

		// const downloadPromise = page.waitForEvent('download');
		// await exportBtn.click();
		// const download = await downloadPromise;
		// await download.saveAs('tests/resources/' + download.suggestedFilename());


		// Import Button
		// await page.getByTestId('import-data-btn').setInputFiles(path.join(__dirname, 'tests', 'resources', 'timetracker-db-export.dbb'));
		const importBtn = page.getByTestId('import-data-btn');
		await expect(importBtn).toBeTruthy();
		// await importBtn.click();
		// const fileChooserPromise = page.waitForEvent('filechooser');
		// const fileChooser = await fileChooserPromise;
		// await fileChooser.setFiles(path.join('tests', 'resources', 'timetracker-db-export.dbb'));

	});
});
