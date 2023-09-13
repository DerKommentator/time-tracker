const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	// "api" --> rename it to anything you want
	notification: (action) => {
		ipcRenderer.send('notification', action);
	}
});
