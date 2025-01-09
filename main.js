/**
 * Here we import several things from the electron module that we require to make the Electron application work:
 * 1. app -> controls the lifecycle of the Electron application (when it starts, when it quits)
 * 2. BrowserWindow -> represents the window of the Desktop Application that will contain all the other things
 * 3. BrowserView -> represents the content of each tab. Each BrowserView in this scenario is an instance of the multi well
 * plate application that runs as an independent process.
 * 4.
 */
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

/**
 * This array will track our BrowserViews (one per "tab").
 * Each entry: { id: number, view: BrowserView }
 */
let browserViews = [];
let activeViewId = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,    // If you want 'require' in manager renderer
      contextIsolation: false
    }
  });

  // For dev: load your Angular app at 'http://localhost:4200/manager'
  // For prod: something like: `file://${path.join(__dirname, 'dist', 'plate-app', 'index.html')}#/manager`
  const devUrl = 'http://localhost:4200/manager';
  mainWindow.loadURL(devUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupIpcHandlers();
}

function setupIpcHandlers() {
  // Create a new BrowserView for a new "tab"
  ipcMain.on('create-tab', (event, { tabId }) => {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false, // Typically false for security
        contextIsolation: true
      }
    });

    // For dev: load the plate route
    // In production: `file://.../index.html#/plate`
    const plateUrl = 'http://localhost:4200/plate';
    view.webContents.loadURL(plateUrl);

    // Track it
    browserViews.push({ id: tabId, view });
    // Show it immediately:
    setActiveBrowserView(tabId);
  });

  // Switch which tab is displayed
  ipcMain.on('switch-tab', (event, { tabId }) => {
    setActiveBrowserView(tabId);
  });

  // Remove a tab
  ipcMain.on('remove-tab', (event, { tabId }) => {
    const index = browserViews.findIndex(bv => bv.id === tabId);
    if (index === -1) return;
    const { view } = browserViews[index];

    // If currently active, remove from the window
    if (mainWindow && mainWindow.getBrowserView() === view) {
      mainWindow.setBrowserView(null);
    }

    // Destroy
    view.webContents.destroy();
    browserViews.splice(index, 1);

    // If we removed the active tab, pick another to show
    if (activeViewId === tabId) {
      if (browserViews.length > 0) {
        setActiveBrowserView(browserViews[0].id);
      } else {
        activeViewId = null;
      }
    }
  });
}

/**
 * Shows the chosen BrowserView inside the mainWindow,
 * below the tab manager (we assume ~50px for the manager).
 */
function setActiveBrowserView(tabId) {
  if (!mainWindow) return;

  const entry = browserViews.find((bv) => bv.id === tabId);
  if (!entry) return;

  // If something else is active, clear it
  const currentActive = browserViews.find((bv) => bv.id === activeViewId);
  if (currentActive && mainWindow.getBrowserView() === currentActive.view) {
    mainWindow.setBrowserView(null);
  }

  // Attach the new one
  mainWindow.setBrowserView(entry.view);
  activeViewId = tabId;

  const [winWidth, winHeight] = mainWindow.getSize();
  entry.view.setBounds({
    x: 0,
    y: 100,             // 50px top offset for the manager tab bar
    width: winWidth,
    height: winHeight - 50
  });
  entry.view.setAutoResize({ width: true, height: true });
}

// Standard Electron lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
