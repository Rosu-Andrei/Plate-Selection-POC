const { app, BrowserWindow, ipcMain, webContents, WebContentsView, View } = require('electron');

let mainWindow;
let tabs = [];
let activeTabId = null;

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create a root view container where we will manage all tab views
  const rootView = new View();
  mainWindow.setContentView(rootView);

  // Create the initial tab
  const initialTabId = createTab('https://electronjs.org');
  setActiveTab(initialTabId);

  // Handle window resize to adjust the active tab's view bounds
  mainWindow.on('resize', () => {
    resizeActiveTabView();
  });
}

function createTab(url) {
  const tabId = Date.now().toString();

  // Create new webContents for this tab
  const wc = webContents.create({
    contextIsolation: true,
    nodeIntegration: false
  });

  wc.loadURL(url).catch(err => {
    console.error(`Failed to load URL (${url}):`, err);
  });

  wc.on('did-finish-load', () => {
    console.log(`Tab loaded with URL: ${url}`);
    console.log(`Renderer Process ID: ${wc.getOSProcessId()}`);
  });

  // Wrap the webContents in a WebContentsView
  const view = new WebContentsView({ webContents: wc });

  tabs.push({ id: tabId, view, url });

  return tabId;
}

function setActiveTab(tabId) {
  // Remove old active tab's view if any
  if (activeTabId) {
    const oldTab = tabs.find(t => t.id === activeTabId);
    if (oldTab) {
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

  sendTabsToRenderer();
}

function closeTab(tabId) {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex >= 0) {
    const tab = tabs[tabIndex];
    mainWindow.contentView.removeChildView(tab.view);
    tab.view.webContents.destroy();
    tabs.splice(tabIndex, 1);

    if (tabId === activeTabId) {
      // If we closed the active tab, activate another if available
      if (tabs.length > 0) {
        setActiveTab(tabs[0].id);
      } else {
        app.quit(); // if we close the only tab we have, then application is closed.
      }
    } else {
      // Just update tabs in renderer if the active tab is still valid
      sendTabsToRenderer();
    }
  }
}

function resizeActiveTabView() {
  if (!activeTabId) return;

  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return;

  const [width, height] = mainWindow.getContentSize();
  // The tab bar is ~40px high, so place the view below it
  activeTab.view.setBounds({ x: 0, y: 40, width, height: height - 40 });
}

function sendTabsToRenderer() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tabs-updated', {
      tabs: tabs.map(t => ({ id: t.id, url: t.url })),
      activeTabId
    });
  }
}

// IPC handlers
ipcMain.on('create-new-tab', () => {
  const newTabId = createTab('https://github.com/electron/electron');
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
