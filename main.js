/**
 * Here we import several things from the electron module that we require to make the Electron application work:
 * 1. app -> controls the lifecycle of the Electron application (when it starts, when it quits)
 * 2. BrowserWindow -> represents the window of the Desktop Application that will contain all the other things
 * 3. BrowserView -> represents the content of each tab. Each BrowserView in this scenario is an instance of the multi well
 * plate application that runs as an independent process.
 * 4. ipcMain -> handles the inter process communication between the main process and the render ones. (from each tab)
 */
const {app, BrowserWindow, ipcMain, WebContentsView, BrowserView} = require('electron');
const path = require('path');

let mainWindow = null; // use to track the BrowserWindow

/**
 * This array will track our BrowserViews (one per "tab").
 * Each entry: { id: number, webView: WebContentsView }
 */
let webContentsViews = [];
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
  const pathUrl = `file://${path.join(__dirname, 'dist', 'plate-app', 'browser', 'index.html')}#/manager`
  mainWindow.loadURL(pathUrl);
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
  ipcMain.on('create-tab', (event, {tabId, plateSize}) => {
    /**
     * create a new WebContentsView for the tab content
     */
    const webView = new BrowserView({
      webPreferences: {
        nodeIntegration: false, // Typically false for security
        contextIsolation: true,
        webSecurity: false
      }
    });

    /**
     * we add the new WebContentView to the BrowserWindow
     */
    mainWindow.setBrowserView(webView);
    /**
     * we load in the new BrowserView the plate application by using its route.
     */
    const plateUrl = `file://${path.join(__dirname, 'dist', 'plate-app', 'browser', 'index.html')}#/plate/${plateSize}`; // change to use the dist folder generated after built
    webView.webContents.loadURL(plateUrl);
    /**
     * we push the new BrowserView and its tabId into the array to keep track of it
     */
    webContentsViews.push({id: tabId, webView: webView});

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
    const index = webContentsViews.findIndex(bv => bv.id === tabId);
    if (index === -1) return;

    const entry = webContentsViews[index];
    if (!entry || !entry.webView) {
      console.error(`No valid WebContent found for tabId: ${tabId}`);
      return;
    }

    const {webView} = entry;

    /**
     * remove the currently active view from main window
     */
    if (mainWindow && mainWindow.getBrowserView() === webView) {
      mainWindow.setBrowserView(null);
    }

    /**
     * destroy the view and remove it from the webContentsViews array
     */
    if (webView.webContents) {
      webView.webContents.destroy();
    }
    webContentsViews.splice(index, 1);

    /**
     * if we remove the current active tab, then the next active tab will be the first one in the array
     */
    /*if (activeViewId === tabId) {
      if (webContentsViews.length > 0) {
        setActiveBrowserView(webContentsViews[0].id);
      } else {
        activeViewId = null;
      }
    }*/
  });

  /*ipcMain.on('open-dialog', () => {
    if (mainWindow && mainWindow.getBrowserView()) {
      mainWindow.setBrowserView(null);
    }
  });

  ipcMain.on('close-dialog', () => {

    if (activeViewId) {
      const entry = webContentsViews.find((bv) => bv.id === activeViewId);
      if (entry) {
        mainWindow.setBrowserView(entry.webView);
      }
    }
  });*/

}

/**
 * Shows the chosen BrowserView inside the mainWindow
 */
function setActiveBrowserView(tabId) {
  if (!mainWindow) return;
  /**
   * extract the browserView from the array based on its tabId we receive from the Tab Component
   */
  const entry = webContentsViews.find((wv) => wv.id === tabId);
  if (!entry) return;

  /**
   * we clear the window of the current active tab (not necessary needed but better to have it)
   */
  /*const currentActive = webContentsViews.find((wv) => wv.id === activeViewId);
  if (currentActive && currentActive.webView.webContents && mainWindow.webContents === currentActive.webView.webContents) {
    mainWindow.webContents = null;
  }*/

  /**
   * we attach the new view that the user clicked on as the one to be rendered in the main window (BrowserWindow)
   */
    //mainWindow.contentView.addChildView(entry.webView);
    //activeViewId = tabId; // we set its id as the activeViewId

  const [winWidth, winHeight] = mainWindow.getSize();
  entry.webView.setBounds({
    x: 0,
    y: 150,
    width: winWidth,
    height: winHeight
  });

  mainWindow.setBrowserView(entry.webView);
  activeViewId = tabId;
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
