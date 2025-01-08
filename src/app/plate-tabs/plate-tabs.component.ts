import { Component, OnInit } from '@angular/core';

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
export class PlateTabsComponent implements OnInit {
  tabs: TabData[] = [{ id: 1, tabName: 'Tab 1' }];
  private nextTabId = 2;

  /**
   * Path to the Angular app. This can be:
   *  - 'http://localhost:4200' in development
   *  - 'file:///...' pointing to dist folder in production
   */
  webviewUrl = '';

  ngOnInit(): void {
    // Check if we are in Electron
    if ((window as any)?.process?.versions?.electron) {
      const path = (window as any).require('path');
      const basePath = path.join(__dirname, 'dist', 'plate-app', 'browser', 'index.html');

      // In production, load the local file
      //this.webviewUrl = `file://${basePath}`;
      this.webviewUrl = 'http://localhost:4200';
    } else {
      // If not in Electron, fallback to dev server
      this.webviewUrl = 'http://localhost:4200';
    }
  }

  /**
   * Adds a new in-app tab without spawning a new Electron BrowserWindow
   */
  addTab(): void {
    this.tabs.push({
      id: this.nextTabId,
      tabName: 'Tab ' + this.nextTabId
    });
    this.nextTabId++;
  }

  removeTab(index: number): void {
    this.tabs.splice(index, 1);
  }
}
