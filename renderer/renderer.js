const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.getElementById('tabs-container');
  const newTabButton = document.getElementById('new-tab-button');

  ipcRenderer.on('tabs-updated', (event, { tabs, activeTabId }) => {
    tabsContainer.innerHTML = '';

    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.classList.add('tab');
      if (tab.id === activeTabId) {
        tabEl.classList.add('active');
      }

      const urlObj = new URL(tab.url);
      const tabTitle = document.createElement('span');
      tabTitle.textContent = urlObj.hostname;
      tabEl.appendChild(tabTitle);

      const closeBtn = document.createElement('div');
      closeBtn.classList.add('close-btn');
      closeBtn.textContent = 'X';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        ipcRenderer.send('close-tab', tab.id);
      };
      tabEl.appendChild(closeBtn);

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
