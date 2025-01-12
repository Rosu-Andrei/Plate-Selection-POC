import {Injectable} from '@angular/core';
import {TabData} from "../plate-tabs/plate-tabs.component";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private ipcRenderer: any;

  constructor() {
    if ((window as any)?.require) {
      const electron = (window as any).require('electron');
      this.ipcRenderer = electron.ipcRenderer;
    }
  }

  public createTab(tabId: number, plateSize: number) {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('create-tab', {tabId, plateSize});
    }
  }

  public removeTab(removedTabId: number) {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('remove-tab', {tabId: removedTabId});
    }
  }

  public switchTab(tab: TabData) {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('switch-tab', {tabId: tab.id});
    }
  }
}
