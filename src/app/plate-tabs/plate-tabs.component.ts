import {Component} from '@angular/core';
import {ElectronService} from "../services/electron.service";

/**
 * represents the individual data for each tab, in this case a tab has:
 * id and a name
 */
export type TabData = {
  id: number;
  tabName: string;
  isSelected: boolean
};

@Component({
  selector: 'app-plate-tabs',
  templateUrl: './plate-tabs.component.html',
  styleUrls: ['./plate-tabs.component.css']
})
export class PlateTabsComponent {
  /**
   * the tabs array is used to keep track of the current existing tabs in the electron application.
   */
  tabs: TabData[] = [];
  nextTabId: number = 2; // we set the next id of a future tab to 2 because we now the first tab has an id of 1
  selectedTabId: number = 0;

  constructor(private electronService: ElectronService) {
  }

  /**
   * we create the first tab in the electron application for the tab with id 1
   */
  ngOnInit(): void {
    this.createTab(1);
    this.tabs.push({id: 1, tabName: 'Tab 1', isSelected: true});
    this.selectedTabId = 1;
  }

  /**
   * this method is called when the user clicks on the Add Tab button. It will increment the nextTabId,
   * will add a new object in the tabs array and in the end will call the 'createTab' method
   * that will send a message back to the main electron process.
   */
  addTab(): void {
    const newTabId = this.nextTabId++;
    this.tabs.push({id: newTabId, tabName: 'Tab ' + newTabId, isSelected: true});
    this.createTab(newTabId);
    let currentSelectedTab = this.tabs.find(tabData => tabData.id == this.selectedTabId);
    if (currentSelectedTab == undefined) {
      return;
    }
    currentSelectedTab.isSelected = false;
    this.selectedTabId = newTabId;
  }

  /**
   * method is responsible for removal of the tab by its id. It also sends a message back to the
   * main electron process.
   */
  removeTab(index: number): void {
    const removedTabId = this.tabs[index].id;
    this.tabs.splice(index, 1);
    this.electronService.removeTab(removedTabId);
    if (!this.tabs[index].isSelected) {
      return;
    } else {
      this.selectedTabId = this.tabs[0].id;
      this.tabs[0].isSelected = true;
    }

  }

  /**
   * Captures the click event of a respective tab and send that information to the main electron process
   */
  switchTab(tab: TabData): void {
    this.electronService.switchTab(tab);
    let currentSelectedTab = this.tabs.find(tabData => tabData.id == this.selectedTabId);
    if (currentSelectedTab == undefined) {
      return;
    }
    currentSelectedTab.isSelected = false;
    this.selectedTabId = tab.id;
    tab.isSelected = true;

  }

  /**
   * this method sends a message to the electron main process to create a new tab
   * to which will also add a new BrowserView for the respective tabId.
   */
  private createTab(tabId: number): void {
    this.electronService.createTab(tabId);
  }
}
