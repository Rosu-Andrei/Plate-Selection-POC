import { Component } from '@angular/core';

/**
 * this type is used to represent every tab created.
 */
type TabData = {
  id: number;
  tabName: string;
};

@Component({
  selector: 'app-plate-tabs',
  templateUrl: './plate-tabs.component.html',
  styleUrls: ['./plate-tabs.component.css'],
})
export class PlateTabsComponent {
  tabs: TabData[] = [{ id: 1, tabName: 'Tab 1' }];
  private nextTabId = 2;

  /**
   * when the + sign is pressed, this method will send a message to the main
   * electron application to create a new BrowserWindow.
   */
  addTab(): void {
    // Only try to use ipcRenderer if we are indeed inside Electron.
    if ((window as any)?.require) {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('new-tab');
    } else {
      console.warn('Not running inside Electron! Cannot create new tab.');
    }
  }

  /**
   * this method will only remove a tab from the Angular application side
   * but will not impact the electron app.
   */
  removeTab(index: number): void {
    this.tabs.splice(index, 1);
  }
}
