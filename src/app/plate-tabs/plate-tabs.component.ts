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

  constructor(public electronService: ElectronService) {
  }

  /**
   * we create the first tab in the electron application for the tab with id 1
   */
  ngOnInit(): void {
    this.electronService.initializeTabs();
  }

  addTab(): void {
    this.electronService.addTab(96);
  }

  removeTab(index: number): void {
    const tab = this.electronService.getTabs()[index];
    if (tab) {
      this.electronService.removeTab(tab.id);
    }
  }

  switchTab(tab: TabData): void {
    this.electronService.switchTab(tab.id);
  }

  getTabs(): TabData[] {
    return this.electronService.getTabs();
  }
}
