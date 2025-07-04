const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../docs/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

/* ----------  App lifecycle  ---------- */
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  /* ----- IPC navigation ----- */
  //Go from home to menu
  ipcMain.on('navigate-to-menu', () => {
    if (mainWindow) {
      mainWindow.loadFile(path.join(__dirname, '../docs/menu.html'));
    } else {ˆ	
      console.error('mainWindow is undefined');
    }
  });

  //Go from menu back home
  ipcMain.on('navigate-to-home', () => {
    if (mainWindow) {
      mainWindow.loadFile(path.join(__dirname, '../docs/index.html'));
    }
  });

  ipcMain.on('navigate-to-text', () => {
    mainWindow.loadFile(path.join(__dirname, '../docs/text.html'));
  });
  
  ipcMain.on('navigate-to-call', () => {
    mainWindow.loadFile(path.join(__dirname, '../docs/call.html'));
  });
  
  ipcMain.on('navigate-to-hug', () => {
    mainWindow.loadFile(path.join(__dirname, '../docs/hug.html'));
  });
  
  ipcMain.on('navigate-to-hungry', () => {
    mainWindow.loadFile(path.join(__dirname, '../docs/hungry.html'));
  });

  /* macOS: recreate window when dock icon clicked and no other windows open */
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
