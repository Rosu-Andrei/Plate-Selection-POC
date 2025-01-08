import { Component } from '@angular/core';

declare global {
  interface Window {
    require: any;
  }
}

type TabData = {
  id: number;
  tabName: string;
};

@Component({
  selector: 'app-plate-tabs',
  templateUrl: './plate-tabs.component.html',
  styleUrls: ['./plate-tabs.component.css']
})
export class PlateTabsComponent {
  tabs: TabData[] = [{ id: 1, tabName: 'Tab 1' }];
  nextTabId = 2;

  private ipcRenderer: any;

  constructor() {
    if ((window as any)?.require) {
      const electron = (window as any).require('electron');
      this.ipcRenderer = electron.ipcRenderer;
    }
  }

  ngOnInit(): void {
    // Create the first BrowserView automatically
    this.createTab(1);
  }

  addTab(): void {
    const newTabId = this.nextTabId++;
    this.tabs.push({ id: newTabId, tabName: 'Tab ' + newTabId });
    this.createTab(newTabId);
  }

  removeTab(index: number): void {
    const removedTabId = this.tabs[index].id;
    this.tabs.splice(index, 1);

    if (this.ipcRenderer) {
      this.ipcRenderer.send('remove-tab', { tabId: removedTabId });
    }
  }

  switchTab(tab: TabData): void {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('switch-tab', { tabId: tab.id });
    }
  }

  private createTab(tabId: number): void {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('create-tab', { tabId });
    }
  }
}
