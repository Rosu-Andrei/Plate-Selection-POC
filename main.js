const { app, BrowserWindow } = require('electron');
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
      nodeIntegration: true,    // Enables `require` in the renderer process
      contextIsolation: false,  // Must be false when `nodeIntegration` is true
      webviewTag: true          // IMPORTANT: Enable <webview> usage in Renderer
    }
  });

  // Load the Angular app (compiled output in the `dist/` folder)
  // Adjust this path to match your build output if necessary
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

// App lifecycle events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Quit the app unless on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
