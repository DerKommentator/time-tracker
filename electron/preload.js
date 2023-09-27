const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
	send: (channel, data) => {
		let validChannels = [
			'notification',
			'trigger-close',
			'app_version',
			'restart_app',
			'check_for_updates'
		]; // <-- Array of all ipcRenderer Channels used in the client
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, func) => {
		let validChannels = [
			'sendEvent-saveTime',
			'sendEvent-set-startTime',
			'sendEvent-exit',
			'app_version',
			'update_available',
			'update_downloaded',
			'update_not_available',
			'update_error'
		]; // <-- Array of all ipcMain Channels used in the electron
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
		}
	},
	removeAllListeners: (channel) => {
		ipcRenderer.removeAllListeners(channel);
	}
	// notification: (action) => {
	// 	ipcRenderer.send('notification', action);
	// }
});

contextBridge.exposeInMainWorld('IN_DESKTOP_ENV', true);
contextBridge.exposeInMainWorld('CURRENT_TIME', new Date());
