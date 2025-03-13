import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-select-dialog',
  templateUrl: './select-dialog.component.html',
  styleUrl: './select-dialog.component.css'
})
export class SelectDialogComponent {

  options = ['A', 'B', 'C', 'D', 'E', 'F'];

  constructor(private dialogRef: MatDialogRef<SelectDialogComponent>) {
  }

  close() {
    this.dialogRef.close();
  }

}
