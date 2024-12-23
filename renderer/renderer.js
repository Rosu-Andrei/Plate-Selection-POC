/**
 * we need ipcRenderer from the electron module to make communications possible
 * to the app.js process.
 */
const { ipcRenderer } = require('electron');

/**
 * this listener is used so that we make sure that the DOM is loaded
 * with all necessary data before any element is accessing.
 */
document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('tabs-container');
  const newTabButton = document.getElementById('new-tab-button');
  /**
   * listens for 'tabs-updated' message from the main process. Once it receives it,
   * we create a div for each element of the tabs array received from the main process.
   */
  ipcRenderer.on('tabs-updated', (event, { tabs, activeTabId }) => {
    tabsContainer.innerHTML = '';

    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.classList.add('tab');
      if (tab.id === activeTabId) {
        tabEl.classList.add('active');
      }
      /**
       * for each tab we set up the title, the x button and its functionality.
       */
      const tabTitle = document.createElement('span');
      tabTitle.textContent = 'Plate Application'
      tabEl.appendChild(tabTitle);

      const closeBtn = document.createElement('div');
      closeBtn.classList.add('close-btn');
      closeBtn.textContent = 'X';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        ipcRenderer.send('close-tab', tab.id);
      };
      tabEl.appendChild(closeBtn);
      /**
       * when the user clicks on a tab, we send to the main process the 'activate-tab' message with
       * the tab id, so that that tab will be selected.
       */
      tabEl.onclick = () => {
        ipcRenderer.send('activate-tab', tab.id);
      };

      tabsContainer.appendChild(tabEl);
    });
  });

  newTabButton.onclick = () => {
    ipcRenderer.send('create-new-tab');
  };
});
