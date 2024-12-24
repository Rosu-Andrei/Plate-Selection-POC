import { Component } from '@angular/core';

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
  tabs: number[] = [1]; // Start with one tab open

  /**
   * Add a new tab by pushing a unique number
   * or any other data structure if you prefer.
   */
  addTab(): void {
    this.tabs.push(this.tabs.length + 1);
  }

  /**
   * Remove a tab at a given index.
   */
  removeTab(index: number): void {
    this.tabs.splice(index, 1);
  }
}
