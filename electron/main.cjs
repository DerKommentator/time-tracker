// Modules to control application life and create native browser window
const { log } = require('console');
const {
	app,
	crashReporter,
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

// console.log(app.getPath('crashDumps'));
crashReporter.start({ submitURL: '', uploadToServer: false });

const isDevEnvironment = process.env.APP_DEV === 'true';
const isTestingEnvironment = process.env.APP_TESTING === 'true';

let updateDownloaded = false;
let savedTodaysEntry = false;

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

let language = 'de';
let translations = {
	en: {
		yesText: 'Yes',
		noText: 'No',
		notify: {
			wakeupHeadline: 'Good Morning 😴',
			wakeupBody: 'Hej! A new working day begins!'
		},
		msgBox: {
			quitTitle: 'Save current time?',
			quitBodyText: 'Do you want to save the current time as work of end time?'
		}
	},
	de: {
		yesText: 'Ja',
		noText: 'Nein',
		notify: {
			wakeupHeadline: 'Guten Morgen 😴',
			wakeupBody: 'Hej! Ein neuer Arbeitstag beginnt!'
		},
		msgBox: {
			quitTitle: 'Aktuelle Zeit sichern?',
			quitBodyText: 'Möchtest du noch die aktuelle Zeit als Arbeitsende speichern?'
		}
	}
};

let showNotify = false;
let top = {}; // prevent gc to keep windows

function createWindow() {
	// Create the browser window.
	let mws = ws({
		defaultWidth: 1080,
		defaultHeight: 720
	});

	const wIcon = nativeImage.createFromPath(path.join(__dirname, 'logoPng/icon.png'));
	const windowIcon = wIcon.resize({ width: 32, height: 32 });

	top.mainWindow = new BrowserWindow({
		x: mws.x,
		y: mws.y,
		width: mws.width,
		height: mws.height,
		title: 'TimeTracker',
		darkTheme: true,
		show: false,
		contextIsolation: true,
		sandbox: true,
		icon: windowIcon,

		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
			// nodeIntegration: isTestingEnvironment ? true : false,
			// contextIsolation: isTestingEnvironment ? false : true
		}
	});

	top.mainWindow.hide();

	// const tIcon = nativeImage.createFromPath(path.join(__dirname, 'logoPng/icon.png'));
	// const trayIcon = tIcon.resize({ width: 32, height: 32 });

	if (!isTestingEnvironment) {
		top.mainWindow.on('close', (event) => {
			//mainWindow = null;
			top.mainWindow.hide();
			event.preventDefault(); // prevent quit process
		});
	}

	top.mainWindow.tray = new Tray(windowIcon);
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
	if (isDevEnvironment && !isTestingEnvironment) {
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

		top.mainWindow.once('ready-to-show', () => {
			if (!isTestingEnvironment) {
				autoUpdater.checkForUpdatesAndNotify();
			}
		});

		log('Electron running in prod mode: 🚀');
	}
}

// ============= IPC =============

ipcMain.on('notification', (event, arg) => {
	showNotification(arg[0], arg[1]);
});

ipcMain.on('trigger-close', () => {
	// BrowserWindow "close" event spawn after quit operation,
	// it requires to clean up listeners for "close" event

	top?.mainWindow?.removeAllListeners('close');

	top?.mainWindow.tray?.destroy();

	// release windows
	top = null;

	app.exit();
});

ipcMain.on('change-Language', (event, selectedLanguage) => {
	language = selectedLanguage;
});

ipcMain.on('change-AutoStart', (event, isAutoStart) => {
	app.setLoginItemSettings({
		openAtLogin: isAutoStart,
		enabled: isAutoStart
	});
});

ipcMain.on('show-After-Startup', () => {
	top.mainWindow.show();
});

ipcMain.on('saved-todays-entry', () => {
	savedTodaysEntry = true;
});

ipcMain.on('deleted-todays-entry', () => {
	savedTodaysEntry = false;
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
	updateDownloaded = true;
});

ipcMain.on('check_for_updates', () => {
	autoUpdater.checkForUpdates();
});

ipcMain.on('restart_app', () => {
	top.mainWindow.removeAllListeners('before-quit');
	app.removeAllListeners('before-quit');
	if (updateDownloaded) {
		autoUpdater.quitAndInstall();
	}
});

// ============= Electron App Events =============

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once('ready', createWindow);

// app.whenReady().then(() => {
// 	createWindow();
// });

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

if (!app.requestSingleInstanceLock()) {
	top = null;
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (top?.mainWindow) {
			if (top?.mainWindow?.isMinimized()) {
				top?.mainWindow?.restore();
			}
			top?.mainWindow?.focus();
		}
	});

	// Create myWindow, load the rest of the app, etc...
	app.on('ready', () => {});
}

if (!isTestingEnvironment) {
	app.on('before-quit', (e) => {
		if (!updateDownloaded && !savedTodaysEntry) {
			e.preventDefault();
			dialog
				.showMessageBox({
					type: 'info',
					buttons: [
						translations[language]?.yesText || translations.en.yesText,
						translations[language]?.noText || translations.en.noText
					],
					cancelId: -1,
					defaultId: 0,
					title: translations[language]?.msgBox.quitTitle || translations.en.msgBox.quitTitle,
					detail: translations[language]?.msgBox.quitBodyText || translations.en.msgBox.quitBodyText
				})
				.then(({ response }) => {
					if (response == 0) {
						// trigger save of time in app
						top.mainWindow.webContents.send('sendEvent-saveTime');
						top.mainWindow.webContents.send('sendEvent-exit');
					} else if (response == 1) {
						// BrowserWindow "close" event spawn after quit operation,
						// it requires to clean up listeners for "close" event
						top?.mainWindow?.removeAllListeners('close');

						top?.mainWindow?.tray?.destroy();

						// release windows
						top = null;

						app.exit();
					}
				});
		}

		top?.mainWindow?.removeAllListeners('close');
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

// ============= Electron PowerMonitor Events =============

// powerMonitor.addListener('lock-screen', () => {});

app.whenReady().then(() => {
	powerMonitor.on('unlock-screen', () => {
		if (showNotify) {
			setTimeout(function () {
				showNotification(
					translations[language]?.notify.wakeupHeadline || translations.en.notify.wakeupHeadline,
					translations[language]?.notify.wakeupBody || translations.en.notify.wakeupBody
				);
			}, 2000);
			showNotify = false;
		}
	});

	powerMonitor.on('suspend', () => {
		log('suspend');
		top.mainWindow.webContents.send('sendEvent-saveTime');
		showNotify = true;
	});

	powerMonitor.on('resume', () => {
		log('resume');
		top.mainWindow.webContents.send('sendEvent-set-startTime');
		top?.mainWindow?.reload();
	});

	// https://www.npmjs.com/package/@paymoapp/electron-shutdown-handler
	// shutdown only works on linux / macOS
	powerMonitor.on('shutdown', (event) => {
		log('shutdown');
		//showNotification('Shutdown', 'Shutdown');
	});
});

// ============= Electron Process Events =============

process.on('exit', (event) => {
	//event.preventDefault();
	log('exit shutdown');
});
