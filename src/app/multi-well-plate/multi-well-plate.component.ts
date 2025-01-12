import {Component, OnInit} from '@angular/core';
import {faBars, faFlask, faSearchMinus, faSearchPlus,} from '@fortawesome/free-solid-svg-icons';
import {mockWells, Well} from '../model/well';
import {PlateService} from '../services/plate.service';
import {WellSelectionService} from '../services/well-selection.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-multi-well-plate',
  templateUrl: './multi-well-plate.component.html',
  styleUrls: ['./multi-well-plate.component.css'],

  //providers: [PlateService, WellSelectionService]
})
export class MultiWellPlateComponent implements OnInit {
  faFlask = faFlask;
  faSearchPlus = faSearchPlus;
  faSearchMinus = faSearchMinus;
  faBars = faBars;

  zoomLevel: number = 1; // Initial zoom level
  menuVisible: boolean = false; // Whether the side menu is visible or not
  activeTab: string = 'well-settings'; // Default active tab
  sampleId: string = ''; // Default sample ID
  sampleRole: string = 'Unknown Sample'; // Default sample role
  currentWell: Well | null = null; // Currently selected single well
  selectedWellsPositions: string = ''; // IDs of selected wells

  baseCellSize: number = 30; // Base size for cells in pixels


  constructor(
    public plateService: PlateService,
    public selectionService: WellSelectionService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const sizeParam = params.get('size');
      console.log("Size param is: " + sizeParam);
      if (sizeParam) {
        const plateSize = +sizeParam;
        if (plateSize === 96 || plateSize === 384) {
          this.plateService.setupPlate(plateSize);
          this.selectionService.clearSelection();
          this.selectionService.initializeWorker();
        } else {
          console.log("Plate size: " + plateSize + " is not supported");
        }
      }
    });
    /**
     * we subscribe to the Subject so that we receive the array that contains only the wells
     * that have been selected currently.
     */
    this.selectionService.selectionChangeSubject.subscribe(
      (selectedWells: Well[]) => {
        this.updateCurrentWellPosition();
        this.updateSampleInfo();
      }
    );

  }

  get cellSize(): number {
    return this.baseCellSize * this.zoomLevel;
  }

  get gridTemplateColumns(): string {
    if (this.plateService.columnHeaders && this.plateService.columnHeaders.length > 0) {
      return '30px ' + this.plateService.columnHeaders.map(() => '30px').join(' ');
    } else {
      return '30px';
    }
  }

  get gridTemplateRows(): string {
    if (this.plateService.rowHeaders && this.plateService.rowHeaders.length > 0) {
      return '30px ' + this.plateService.rowHeaders.map(() => '30px').join(' ');
    } else {
      return '30px';
    }
  }

  selectPlate(plateSize: number | undefined): void {
    if (plateSize !== 96 && plateSize !== 384) {
      console.error('Unsupported plate size:', plateSize);
      return;
    }
    this.plateService.setupPlate(plateSize);
    this.selectionService.clearSelection();
    this.selectionService.initializeWorker();
  }

  load(): void {
    this.selectionService.clearSelection();
    mockWells.forEach((well) => {
      const selectedWell = this.plateService.getFlatWells().find(w => w.id === well.id);

      if (selectedWell === undefined) {
        console.error(
          `Well ID ${well.id} is out of bounds for the current plate size (${this.plateService.rows} rows x ${this.plateService.columns} columns).`
        );
        return;
      }
      selectedWell.sampleId = well.sampleId;
      selectedWell.sampleRole = well.sampleRole;
      const event = {
        ctrlKey: true,
        metaKey: true,
        shiftKey: false,
      } as MouseEvent;
      this.selectionService.toggleWellSelection(event, selectedWell);
    });
  }

  toggleWellSelection(event: MouseEvent, well: Well): void {
    this.selectionService.toggleWellSelection(event, well);
  }

  toggleRowSelection(event: MouseEvent, rowIndex: number): void {
    this.selectionService.toggleRowSelection(event, rowIndex);
  }

  toggleColumnSelection(event: MouseEvent, columnIndex: number): void {
    this.selectionService.toggleColumnSelection(event, columnIndex);
  }

  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.1;
      this.zoomLevel = Math.round(this.zoomLevel * 10) / 10;
      this.updateScrollContainer();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.1);
      this.zoomLevel = Math.round(this.zoomLevel * 10) / 10;
      this.updateScrollContainer();
    }
  }

  private updateScrollContainer(): void {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
    if (scrollContainer) {
      if (this.zoomLevel !== 1) {
        scrollContainer.classList.add('zoomed');
      } else {
        scrollContainer.classList.remove('zoomed');
      }
    }
  }

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * this method determines if only a single well has been selected. If it is so,
   * then the current well will point to this well. If multiple wells are selected or none, then
   * the current well will receive the null value.
   *
   * This method is essential in showing the current selected well position in the readOnly box
   */
  updateCurrentWellPosition(): void {
    const currentSelection = this.selectionService.selection;
    if (currentSelection.selected.length === 1) {
      this.currentWell = currentSelection.selected[0];
      this.selectedWellsPositions = this.currentWell.id;
    } else if (currentSelection.selected.length > 1) {
      this.currentWell = null;
      this.selectedWellsPositions = currentSelection.selected.map((well) => well.id).join(' ');
    } else {
      this.currentWell = null;
      this.selectedWellsPositions = '';
    }
  }

  /**
   * This method is very similar in what it does with the one above. The difference is that,
   * it displays the sampleID and sampleRole that a selected well has.
   *
   * If multiple wells are selected, the window will display "" as the id and Unknown Value as the sample role.
   */
  updateSampleInfo(): void {
    const array = this.selectionService.selection.selected;
    if (this.currentWell) {
      this.sampleId = this.currentWell.sampleId || '';
      this.sampleRole = this.currentWell.sampleRole || 'Unknown Sample';
    } else {
      this.sampleId = '';
      this.sampleRole = 'Unknown Sample';
      array.forEach((well) => {
        if (well.sampleId) {
          this.sampleId += well.sampleId + ' ';
        }
      });
      if (this.sampleId.trim() === '') {
        this.sampleId = 'No sample ID has been entered';
      }
    }
  }

  /**
   * When the user enters a sampleId, this method will:
   * 1. update the component sampleId (because we want to show it updated in the browser)
   * 2. Each selected well will receive the sampleId entered. (if only one is selected,
   * the only one will receive it)
   */
  onSampleIdChange(newSampleId: string): void {
    this.sampleId = newSampleId;
    this.selectionService.selection.selected.forEach((well) => {
      well.sampleId = newSampleId;
    });
  }

  /**
   * This method is very similar with the one above, the only difference being that
   * it is updating the Sample Role property.
   */
  onSampleRoleChange(newSampleRole: string): void {
    this.sampleRole = newSampleRole;
    this.selectionService.selection.selected.forEach((well) => {
      well.sampleRole = newSampleRole;
    });
  }
}
