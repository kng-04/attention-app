const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  goToHome: () => ipcRenderer.send('navigate-to-home'),
  goToMenu: () => ipcRenderer.send('navigate-to-menu')
});