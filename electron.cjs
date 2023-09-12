// Modules to control application life and create native browser window
const { log } = require('console')
const { app, BrowserWindow } = require('electron')
const path = require('path')
const ws = require("electron-window-state");
//const serve = require("electron-serve");
try { require("electron-reloader")(module); } catch {}

if (require('electron-squirrel-startup')) app.quit();

//const loadURL = serve({directory: "."});
const isDevEnvironment = process.env.APP_DEV === 'true' || "true";
const port = process.env.PORT || 5173;

function loadVite(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
        setTimeout(() => { loadVite(port); }, 200);
    });
}

// enable live reload for electron in dev mode
// if (isDevEnvironment) {
//     require('electron-reload')(__dirname, {
//         electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
//         hardResetMethod: 'exit'
//     });
// }

let mainWindow;

const createWindow = () => {
    
    // Create the browser window.
    let mws = ws({
        defaultWidth: 1300,
        defaultHeight: 1000
    });

    mainWindow = new BrowserWindow({
        x: mws.x,
        y: mws.y,
        width: mws.width,
        height: mws.height,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDevEnvironment || true
        }
    });

    mainWindow.once("close", () => { mainWindow = null; });

    // define how electron will load the app
    if (isDevEnvironment) {

        // if your vite app is running on a different port, change it here
        //mainWindow.loadURL('http://localhost:5173/');
        mws.manage(mainWindow);
        loadVite(port);

        // Open the DevTools.
        mainWindow.webContents.on("did-frame-finish-load", () => {
            mainWindow.webContents.openDevTools();
        });

        log('Electron running in dev mode: 🧪')

    } else {
        mainWindow.removeMenu();
        
        // when not in dev mode, load the build file instead
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
        // loadURL(mainWindow);

        log('Electron running in prod mode: 🚀')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.