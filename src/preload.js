const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  goToHome: () => ipcRenderer.send('navigate-to-home'),
  goToMenu: () => ipcRenderer.send('navigate-to-menu'),
  goToText: () => ipcRenderer.send('navigate-to-text'),
  goToCall: () => ipcRenderer.send('navigate-to-call'),
  goToHug: () => ipcRenderer.send('navigate-to-hug'),
  goToHungry: () => ipcRenderer.send('navigate-to-hungry')
});