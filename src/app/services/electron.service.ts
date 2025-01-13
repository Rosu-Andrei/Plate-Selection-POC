import {Injectable} from '@angular/core';
import {TabData} from "../plate-tabs/plate-tabs.component";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private ipcRenderer: any;
  /**
   * the tabs array is used to keep track of the current existing tabs in the electron application.
   */
  public tabs: TabData[] = [];
  private nextTabId: number = 1;
  private selectedTabId: number = 0;

  constructor() {
    if ((window as any)?.require) {
      const electron = (window as any).require('electron');
      this.ipcRenderer = electron.ipcRenderer;
    }
  }

  /**
   * this method is called in the ngOnInit of the tabs component. Is responsible for
   * creating an initial tab for the electron application.
   */
  public initializeTabs(): void {
    this.addTab();
    for (let i = 0; i < 2; i++)
      this.addTab(96);
    this.addTab(384);
  }

  /**
   * this method is called when the user clicks on the Add Tab button. It will increment the nextTabId,
   * will add a new object in the tabs array and in the end will call the 'createTab' method
   * that will send a message back to the main electron process.
   */
  public addTab(plateSize?: number): void {
    const newTabId = this.nextTabId++;
    const newTab: TabData = {
      id: newTabId,
      tabName: `Tab ${newTabId}`,
      isSelected: true,
    };
    const currentSelectedTab = this.tabs.find(tab => tab.id === this.selectedTabId);
    if (currentSelectedTab) {
      currentSelectedTab.isSelected = false;
    }

    this.tabs.push(newTab);
    this.selectedTabId = newTabId;

    this.createTab(newTabId, plateSize);
  }

  public createTab(tabId: number, plateSize?: number) {
    if (this.ipcRenderer) {
      this.ipcRenderer.send('create-tab', {tabId, plateSize});
    }
  }

  /**
   * method is responsible for removal of the tab by its id. It also sends a message back to the
   * main electron process.
   */
  public removeTab(tabId: number): void {
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    this.tabs.splice(tabIndex, 1);

    /**
     * if the current selected tab is deleted, then the first tab will be marked as selected.
     */
    if (this.selectedTabId === tabId) {
      if (this.tabs.length > 0) {
        this.selectedTabId = this.tabs[0].id;
        this.tabs[0].isSelected = true;
      } else {
        this.selectedTabId = 0;
      }
    }
    if (this.ipcRenderer) {
      this.ipcRenderer.send('remove-tab', {tabId});
    }
  }

  /**
   * Captures the click event of a respective tab and send that information to the main electron process
   */
  public switchTab(tabId: number): void {
    /**
     * mark as deselect the tab that is currently selected
     */
    const currentSelectedTab = this.tabs.find(tab => tab.id === this.selectedTabId);
    if (currentSelectedTab) {
      currentSelectedTab.isSelected = false;
    }

    /**
     * mark as selected the newly clicked tab.
     */
    const newSelectedTab = this.tabs.find(tab => tab.id === tabId);
    if (newSelectedTab) {
      newSelectedTab.isSelected = true;
      this.selectedTabId = tabId;

      if (this.ipcRenderer) {
        this.ipcRenderer.send('switch-tab', {tabId});
      }
    }
  }

  /**
   * return the TabData array.
   */
  public getTabs(): TabData[] {
    return this.tabs;
  }


}
