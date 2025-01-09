/**
 * Here we import several things from the electron module that we require to make the Electron application work:
 * 1. app -> controls the lifecycle of the Electron application (when it starts, when it quits)
 * 2. BrowserWindow -> represents the window of the Desktop Application that will contain all the other things
 * 3. BrowserView -> represents the content of each tab. Each BrowserView in this scenario is an instance of the multi well
 * plate application that runs as an independent process.
 * 4. ipcMain -> handles the inter process communication between the main process and the render ones. (from each tab)
 */
const {app, BrowserWindow, BrowserView, ipcMain} = require('electron');
const path = require('path');

let mainWindow = null; // use to track the BrowserWindow

/**
 * This array will track our BrowserViews (one per "tab").
 * Each entry: { id: number, view: BrowserView }
 */
let browserViews = [];
/**
 * keeps track of the current active tab.
 */
let activeViewId = null;

/**
 * this function creates the main Electron application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  /**
   * when the application launches, we load a tab component.
   */
  const url = 'http://localhost:4200/manager';
  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  setupIpcHandlers();
}

/**
 * this method configures the communications between the main Electron window and each tab.
 */
function setupIpcHandlers() {

  /**
   * when the user creates a new tab by clicking the Add Tab button, the Tab component will send
   * a message to the main window. The main window receives the message together with the tabId
   * of the newly created tab.
   */
  ipcMain.on('create-tab', (event, {tabId}) => {
    /**
     * create a new BrowserView for the tab
     */
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false, // Typically false for security
        contextIsolation: true
      }
    });

    /**
     * we load in the new BrowserView the plate application by using its route.
     */
    const plateUrl = 'http://localhost:4200/plate';
    view.webContents.loadURL(plateUrl);
    /**
     * we push the new BrowserView and its tabId into the array to keep track of it
     */
    browserViews.push({id: tabId, view});

    /**
     * we want any newly created tab to be selected.
     */
    setActiveBrowserView(tabId);
  });

  /**
   * listens to the event when the user selects a new tab and makes that tab the new active tab,
   * and displays its content.
   */
  ipcMain.on('switch-tab', (event, {tabId}) => {
    setActiveBrowserView(tabId);
  });

  /**
   * listens to the removal of a tab by the user.
   */
  ipcMain.on('remove-tab', (event, {tabId}) => {
    const index = browserViews.findIndex(bv => bv.id === tabId);
    if (index === -1) return;
    const {view} = browserViews[index];

    // If currently active, remove from the window
    if (mainWindow && mainWindow.getBrowserView() === view) {
      mainWindow.setBrowserView(null);
    }

    /**
     * we destroy the view, and we remove it from the array
     */
    view.webContents.destroy();
    browserViews.splice(index, 1);

    /**
     * if the active tab is the one that is deleted, then we set the active tab the first one in the array.
     */
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
 * Shows the chosen BrowserView inside the mainWindow
 */
function setActiveBrowserView(tabId) {
  if (!mainWindow) return;
  /**
   * extract the browserView from the array based on its tabId we receive from the Tab Component
   */
  const entry = browserViews.find((bv) => bv.id === tabId);
  if (!entry) return;

  /**
   * we clear the window of the current active tab
   */
  const currentActive = browserViews.find((bv) => bv.id === activeViewId);
  if (currentActive && mainWindow.getBrowserView() === currentActive.view) {
    mainWindow.setBrowserView(null);
  }

  /**
   * we attach the new view that the user clicked on as the one to be rendered in the main window (BrowserWindow)
   */
  mainWindow.setBrowserView(entry.view);
  activeViewId = tabId; // we set its id as the activeViewId

  const [winWidth, winHeight] = mainWindow.getSize();
  entry.view.setBounds({
    x: 0,
    y: 100,             // 50px top offset for the manager tab bar
    width: winWidth,
    height: winHeight - 50
  });
  entry.view.setAutoResize({width: true, height: true});
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
