/**
 * from the electron module we extract the following variables:
 * 1. app -> manages the electron app lifecycle, including initialization and end.
 * 2. BrowserWindow -> represents the application window
 * 3. ipcMain -> handles inter process communication, like listens for messages from the render process
 * 4. webContents -> allows creation and management of web content (what the tabs display)
 * 5. WebContentsView -> wrapper for the webContents
 */
const {app, BrowserWindow, ipcMain, webContents, WebContentsView, View} = require('electron');

let mainWindow; // Holds the main application window
let tabs = []; // stores all open tabs as objects that contain: id, view and url
let activeTabId = null; // used to track the current active tab id.

/**
 * this method is used to create the main window of the desktop application.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  // Load the UI for the tab bar
  mainWindow.loadFile(__dirname + '/renderer/index.html');
  /**
   * when 'closed' message it received, the application is closed.
   */
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /**
   * the rootView is a container were all the tabs views will be added.
   */
  const rootView = new View();
  mainWindow.setContentView(rootView);

  /**
   * when the application starts, a tab is created by default.
   */
  const initialTabId = createTab();
  setActiveTab(initialTabId);

  // Handle window resize to adjust the active tab's view bounds
  mainWindow.on('resize', () => {
    resizeActiveTabView();
  });
}

/**
 * Ensure path module is included, otherwise an error will be thrown when the app tries
 * to access the files from the dist folder.
 */
const path = require('path');

/**
 * this function is responsible to generate a new webContest for a new instance of the
 * plate application.
 */
function createTab() {
  const tabId = Date.now().toString(); // we create a unique id for each tab

  // Create new webContents for this tab
  const webContent = webContents.create({
    contextIsolation: true,
    nodeIntegration: false
  });

  /**
   * we load the build plate app in the web content.
   */
  const filePath = path.join(__dirname, 'dist', 'plate-app', 'browser', 'index.html');
  webContent.loadFile(filePath).catch(err => {
    console.error(`Failed to load file (${filePath}):`, err);
  });

  /**
   * once the plate app is loaded in the web content, we log the PID of it. We do this
   * to verify that we have different PID for each tab, so we have different threads.
   */
  webContent.on('did-finish-load', () => {
    console.log(`Tab loaded with file: ${filePath}`);
    console.log(`Renderer Process ID: ${webContent.getOSProcessId()}`);
  });

  // Wrap the webContents in a WebContentsView
  const view = new WebContentsView({webContents: webContent});

  // Add the tab to the tabs array
  tabs.push({id: tabId, view, url: filePath});

  return tabId;
}

/**
 * this method is responsible for displaying the view of the tab that the user has selected.
 * It identifies the tab based on its id.
 */
function setActiveTab(tabId) {
  if (activeTabId) {
    const oldTab = tabs.find(t => t.id === activeTabId);
    if (oldTab) {
      /**
       * this means that the previous displayed tab will not be
       */
      mainWindow.contentView.removeChildView(oldTab.view);
    }
  }

  activeTabId = tabId;
  const newTab = tabs.find(t => t.id === tabId);
  if (newTab) {
    // Add the new tab's view
    mainWindow.contentView.addChildView(newTab.view);
    resizeActiveTabView();
  }
  /**
   * we update the renderer UI with the current tab list.
   */
  sendTabsToRenderer();
}

/**
 * method invoked when the user closes a tab. It doesn't
 */
function closeTab(tabId) {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex >= 0) {
    const tab = tabs[tabIndex]; // get the tab view based on its id
    mainWindow.contentView.removeChildView(tab.view); // remove it from the main app
    tab.view.webContents.destroy(); // destroy it
    tabs.splice(tabIndex, 1); // update the tabs array

    if (tabId === activeTabId) {
      /**
       * if we close the active tab, then the next first tab will be selected
       */
      if (tabs.length > 0) {
        setActiveTab(tabs[0].id);
      } else {
        /**
         * if only one tab exists and the user closes it, then the entire application closes.
         */
        app.quit();
      }
    } else {
      // Just update tabs in renderer
      sendTabsToRenderer();
    }
  }
}

/**
 * this method is responsible to resize the active tab to fit the tab bar.
 */
function resizeActiveTabView() {
  if (!activeTabId) return;

  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return;

  const [width, height] = mainWindow.getContentSize();
  activeTab.view.setBounds({x: 0, y: 40, width, height: height - 40});
}

/**
 * this method sends the updated tab array and the active tab id
 * to the renderer process.
 */
function sendTabsToRenderer() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tabs-updated', {
      tabs: tabs.map(t => ({id: t.id, url: t.url})),
      activeTabId
    });
  }
}

/**
 * below we use ipcMain to listen to 3 possible communication between
 * the main process and the renderer process.
 */
ipcMain.on('create-new-tab', () => {
  const newTabId = createTab(); // No URL needed, it loads the local file
  setActiveTab(newTabId);
});

ipcMain.on('activate-tab', (event, tabId) => {
  setActiveTab(tabId);
});

ipcMain.on('close-tab', (event, tabId) => {
  closeTab(tabId);
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
