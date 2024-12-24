const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow = null;

/**
 * Create the main application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Enables `require` in the renderer process
      contextIsolation: false // Must be false when `nodeIntegration` is true
    }
  });

  // Load the Angular app (compiled output in the `dist/` folder)
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/plate-app/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create a new window for each "tab".
 */
function createNewTabWindow() {
  const newTabWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  newTabWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/plate-app/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
}

/**
 * Handle IPC events from the renderer process.
 */
ipcMain.on('new-tab', () => {
  createNewTabWindow();
});

// App lifecycle events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
