// Modules to control application life and create native browser window
const { log } = require('console');
const {
	app,
	BrowserWindow,
	nativeImage,
	Tray,
	Menu,
	Notification,
	ipcMain,
	powerMonitor,
	powerSaveBlocker,
	dialog
} = require('electron');
const path = require('path');
const ws = require('electron-window-state');
const { autoUpdater } = require('electron-updater');

const serve = require('electron-serve');
const serveURL = serve({ directory: '.' });
//const serve = require("electron-serve");
// try {
// 	require('electron-reloader')(module);
// } catch {}

// if (require('electron-squirrel-startup')) app.quit();

app.commandLine.appendSwitch('lang', 'de-DE');
//app.setAsDefaultProtocolClient('timetracker');
if (process.platform === 'win32') {
	app.setAppUserModelId('TimeTracker' || app.name);
}

const isDevEnvironment = process.env.APP_DEV === 'true';
const port = process.env.PORT || 5173;

function showNotification(title, bodyText) {
	const notification = new Notification({
		toastXml: `<toast>
           <visual>
             <binding template="ToastText02">
               <text id="1">${title}</text>
               <text id="2">${bodyText}</text>
             </binding>
           </visual>
        </toast>`
	});

	notification.show();
}

// enable live reload for electron in dev mode
// if (isDevEnvironment) {
// 	require('electron-reload')(__dirname, {
// 		electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
// 		hardResetMethod: 'exit'
// 	});
// }

let suspendAlreadyTriggered = false;
let showNotify = false;
let top = {}; // prevent gc to keep windows

function createWindow() {
	// Create the browser window.
	let mws = ws({
		defaultWidth: 1300,
		defaultHeight: 1000
	});

	const wIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));
	const windowIcon = wIcon.resize({ width: 32, height: 32 });
	windowIcon.setTemplateImage(true);

	top.mainWindow = new BrowserWindow({
		x: mws.x,
		y: mws.y,
		width: mws.width,
		height: mws.height,
		title: 'TimeTracker',
		darkTheme: true,
		show: true,
		contextIsolation: true,
		sandbox: true,
		icon: windowIcon,

		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	});

	const tIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));
	const trayIcon = tIcon.resize({ width: 32, height: 32 });
	trayIcon.setTemplateImage(true);

	top.mainWindow.on('close', (event) => {
		//mainWindow = null;
		top.mainWindow.hide();
		event.preventDefault(); // prevent quit process
	});

	top.mainWindow.tray = new Tray(trayIcon);
	const menu = Menu.buildFromTemplate([
		// {
		// 	label: 'Actions',
		// 	submenu: [
		// 		{
		// 			label: 'Open TimeTracker',
		// 			click: (item, window, event) => {
		// 				//console.log(item, event);
		// 				top.mainWindow.show();
		// 			}
		// 		}
		// 	]
		// },
		// { type: 'separator' },
		{ role: 'quit' } // "role": system prepared action menu
	]);

	top.mainWindow.tray.setContextMenu(menu);

	top.mainWindow.tray.on('click', () => {
		top.mainWindow.show();
	});

	top.mainWindow.tray.setToolTip('TimeTracker');
	top.mainWindow.tray.setTitle('TimeTracker'); // macOS only

	powerSaveBlocker.start('prevent-app-suspension');

	mws.manage(top.mainWindow);
	// define how electron will load the app
	if (isDevEnvironment) {
		// if your vite app is running on a different port, change it here
		top.mainWindow.loadURL('http://localhost:5173/');
		//loadVite(port);

		// Open the DevTools.
		top.mainWindow.webContents.on('did-frame-finish-load', () => {
			top.mainWindow.webContents.openDevTools();
		});

		log('Electron running in dev mode: 🧪');
	} else {
		top.mainWindow.removeMenu();

		// when not in dev mode, load the build file instead
		//top.mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
		serveURL(top.mainWindow);

		log('Electron running in prod mode: 🚀');
	}

	top.mainWindow.once('ready-to-show', () => {
		autoUpdater.checkForUpdatesAndNotify();
	});
}

// ============= IPC =============

ipcMain.on('notification', (event, arg) => {
	showNotification(arg[0], arg[1]);
});

ipcMain.on('trigger-close', () => {
	// BrowserWindow "close" event spawn after quit operation,
	// it requires to clean up listeners for "close" event

	top?.mainWindow?.removeAllListeners('close');

	// release windows
	top = null;

	top.mainWindow.tray.destroy();

	app.exit();
});

// ============= Updater =============

ipcMain.on('app_version', (event) => {
	top.mainWindow.webContents.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
	top.mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-not-available', () => {
	top.mainWindow.webContents.send('update_not_available');
});

autoUpdater.on('error', (error) => {
	top.mainWindow.webContents.send('update_error', { error: error });
});

autoUpdater.on('update-downloaded', () => {
	top.mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('check_for_updates', () => {
	autoUpdater.checkForUpdates();
});

ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});

// ============= Electron App Events =============

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once('ready', createWindow);

app.setLoginItemSettings({
	openAtLogin: true
});

// app.whenReady().then(() => {
// 	createWindow();
// });

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', (e) => {
	e.preventDefault();
	dialog
		.showMessageBox({
			type: 'info',
			buttons: ['Yes', 'No'],
			cancelId: 1,
			defaultId: 0,
			title: 'Warning',
			detail: 'Do you want to save the current time as work of end time?'
		})
		.then(({ response }) => {
			if (response == 0) {
				// trigger save of time in app
				top.mainWindow.webContents.send('sendEvent-saveTime');
				top.mainWindow.webContents.send('sendEvent-exit');
			} else {
				// BrowserWindow "close" event spawn after quit operation,
				// it requires to clean up listeners for "close" event
				top.mainWindow.removeAllListeners('close');

				// release windows
				top = null;

				app.exit();
			}

			top.mainWindow.tray.destroy();
		});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

// ============= Electron PowerMonitor Events =============

// powerMonitor.addListener('lock-screen', () => {});

powerMonitor.addListener('unlock-screen', () => {
	if (suspendAlreadyTriggered && showNotify) {
		setTimeout(function () {
			showNotification('Guten Morgen 😴', 'Hej! Ein neuer Arbeitstag beginnt!');
		}, 3000);

		suspendAlreadyTriggered = false;
		showNotify = false;
	}
});

powerMonitor.addListener('suspend', () => {
	log('suspend');
	if (!suspendAlreadyTriggered) {
		top.mainWindow.webContents.send('sendEvent-saveTime');

		suspendAlreadyTriggered = true;
		showNotify = true;
	}
});

powerMonitor.addListener('resume', () => {
	log('resume');
	top.mainWindow.webContents.send('sendEvent-set-startTime');
	top.mainWindow.reload();
});

// https://www.npmjs.com/package/@paymoapp/electron-shutdown-handler
// shutdown only works on linux / macOS
powerMonitor.addListener('shutdown', (event) => {
	log('shutdown');
	//showNotification('Shutdown', 'Shutdown');
});

// ============= Electron Process Events =============

process.on('exit', (event) => {
	//event.preventDefault();
	log('exit shutdown');
});
