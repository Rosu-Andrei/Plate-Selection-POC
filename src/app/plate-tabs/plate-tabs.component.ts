import { Component } from '@angular/core';

type TabData = {
  id: number
  tabName: string
}

@Component({
  selector: 'app-plate-tabs',
  templateUrl: './plate-tabs.component.html',
  styleUrls: ['./plate-tabs.component.css'],
})
export class PlateTabsComponent {
  /**
   * Each item in this array represents a single tab.
   * You can store any type of object here. For simplicity,
   * we'll store just an incrementing numeric ID.
   */
  tabs: TabData[] = [{id: 1, tabName: 'Tab 1'}]; // Start with one tab open
  private nextTabId = 2;

  /**
   * When a new tab is added, we increment the length of the 'tabs' array.
   */
  addTab(): void {
    this.tabs.push({ id: this.nextTabId++, tabName: `Tab ${this.tabs.length + 1}` });
  }

  /**
   * When the user removes a certain tab in the browser, the application will
   *
   */
  removeTab(index: number): void {
    this.tabs.splice(index, 1);
  }
}
