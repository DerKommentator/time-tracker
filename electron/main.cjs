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
	powerMonitor
} = require('electron');
const path = require('path');
const ws = require('electron-window-state');
//const serve = require("electron-serve");
try {
	require('electron-reloader')(module);
} catch {}

if (require('electron-squirrel-startup')) app.quit();

app.commandLine.appendSwitch('lang', 'de-DE');
//app.setAsDefaultProtocolClient('timetracker');
if (process.platform === 'win32') {
	app.setAppUserModelId('TimeTracker' || app.name);
}

//const loadURL = serve({directory: "."});
const isDevEnvironment = process.env.APP_DEV === 'true' || 'true';
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
           <actions>
             <action content="Count up" activationType="protocol" arguments="timetracker://notify" />
             <action content="Count down" activationType="protocol" arguments="timetracker://notify2" />
           </actions>
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

let top = {}; // prevent gc to keep windows

const createWindow = () => {
	// Create the browser window.
	let mws = ws({
		defaultWidth: 1300,
		defaultHeight: 1000
	});

	top.mainWindow = new BrowserWindow({
		x: mws.x,
		y: mws.y,
		width: mws.width,
		height: mws.height,
		title: 'Timetracker',

		webPreferences: {
			preload: path.join(app.getAppPath(), 'preload.js')
		}
	});

	top.mainWindow.on('close', (event) => {
		//mainWindow = null;
		top.mainWindow.hide();
		event.preventDefault(); // prevent quit process
	});

	top.mainWindow.tray = new Tray(nativeImage.createEmpty());
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

	// define how electron will load the app
	if (isDevEnvironment) {
		// if your vite app is running on a different port, change it here
		mws.manage(top.mainWindow);
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
		top.mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
		// loadURL(top.mainWindow);

		log('Electron running in prod mode: 🚀');
	}
};

ipcMain.on('notification', (event, arg) => {
	showNotification(arg[0], arg[1]);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once('ready', createWindow);

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
	// BrowserWindow "close" event spawn after quit operation,
	// it requires to clean up listeners for "close" event
	top.mainWindow.removeAllListeners('close');
	// release windows
	top = null;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// powerMonitor.addListener('lock-screen', () => {
// 	log('lock-screen');
// });

// powerMonitor.addListener('unlock-screen', () => {
// 	log('unlock-screen');
// });

powerMonitor.addListener('suspend', () => {
	log('suspend');
});

// https://www.npmjs.com/package/@paymoapp/electron-shutdown-handler
// shutdown works only on linux / macOS
powerMonitor.addListener('shutdown', (event) => {
	log('shutdown');
	showNotification('Shutdown', 'Shutdown');
});

process.on('exit', (event) => {
	log('exit shutdown');
});
