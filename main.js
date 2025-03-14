/**
 * Here we import several things from the electron module that we require to make the Electron application work:
 * 1. app -> controls the lifecycle of the Electron application (when it starts, when it quits)
 * 2. BrowserWindow -> represents the window of the Desktop Application that will contain all the other things
 * 3. BrowserView -> represents the content of each tab. Each BrowserView in this scenario is an instance of the multi well
 * plate application that runs as an independent process.
 * 4. ipcMain -> handles the inter process communication between the main process and the render ones. (from each tab)
 */
const {app, BrowserWindow} = require('electron');
const path = require('path');

let mainWindow = null; // use to track the BrowserWindow

/**
 * this function creates the main Electron application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  /**
   * when the application launches, we load a tab component.
   */
    //const url = 'http://localhost:4200/#/manager';
  const pathUrl = `file://${path.join(__dirname, 'dist', 'plate-app', 'browser', 'index.html')}`
  mainWindow.loadURL(pathUrl);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * when the app is ready, we then create the BrowserWindow
 */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
