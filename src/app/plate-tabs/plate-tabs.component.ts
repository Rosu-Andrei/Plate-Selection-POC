import { Component } from '@angular/core';

// A small TypeScript interface for tab data:
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

  // Called by the "+ Add Tab" button in the template
  addTab(): void {
    // Only try to use ipcRenderer if we are indeed inside Electron.
    if ((window as any)?.require) {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('new-tab');
    } else {
      console.warn('Not running inside Electron! Cannot create new tab.');
    }
  }

  removeTab(index: number): void {
    this.tabs.splice(index, 1);
  }
}
