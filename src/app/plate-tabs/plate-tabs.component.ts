import {Component} from '@angular/core';
import {ElectronService} from "../services/electron.service";
import {MatDialog} from "@angular/material/dialog";
import {SelectDialogComponent} from "../select-dialog/select-dialog.component";

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
   * The tabs array is used to keep track of all the current existing tabs in the application.
   * The 'nextTabId' represents what id will be assign to a new tab created.
   */
  public tabs: TabData[] = [];
  private nextTabId: number = 1;


  constructor(public electronService: ElectronService,
              private dialog: MatDialog) {
  }

  /**
   * this method creates initially only 1 tab.
   */
  ngOnInit(): void {
    this.addTab();
  }

  /**
   * the addTab() method is responsible to create a new entry in the tabs array
   */
  addTab(): void {
    const newId = this.nextTabId;
    /**
     * deselect all the tabs
     */
    this.tabs.forEach(tab => tab.isSelected = false);
    /**
     * create a new TabData entry in the tabs array. We make sure that the newly created
     * tab is selected.
     */
    this.tabs.push({
      id: newId,
      tabName: 'Plate Tab ' + newId,
      isSelected: true
    });
    this.nextTabId++;
  }

  removeTab(index: number): void {
    /**
     * we remove from the tabs array the TabData of the corresponding index.
     */
    const tabToBeRemoved = this.tabs[index];
    this.tabs.splice(index, 1);

    /**
     * here we check to see of the tab we want to remove is the one currently selected.
     * If that is the case, then we select the first tab
     */
    if (tabToBeRemoved.isSelected && this.tabs.length > 0) {
      this.tabs[0].isSelected = true;
    }
  }

  switchTab(tabIndex: number): void {
    this.tabs.forEach((tab, index) => {
      if (index === tabIndex) {
        tab.isSelected = true;
      } else {
        tab.isSelected = false;
      }
    })
  }

  getTabs(): TabData[] {
    return this.electronService.getTabs();
  }

  openDialog() {
    const dialogRef = this.dialog.open(SelectDialogComponent);
    this.electronService.openDialog();

    dialogRef.afterClosed().subscribe(() => {
      this.electronService.closeDialog();
    })
  }
}
