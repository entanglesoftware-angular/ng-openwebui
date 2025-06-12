import { Component,ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MatIcon } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ConnectionsDialog } from '../connections-dialog/connections-dialog';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'lib-settings-dialog',
  imports: [MatIcon, NgIf, NgFor],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
  encapsulation: ViewEncapsulation.None
})
export class SettingsDialog {
  ngOnInit(): void {
  const data = localStorage.getItem('savedConnections');
  if (data) {
    this.savedConnections = JSON.parse(data);
  }
}
  constructor(private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  selectedSection = 'default';

  savedConnections: any[] = [];

  onClick() {
    this.dialog
      .open(ConnectionsDialog)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log('Received from dialog:', result);
          this.savedConnections.push({
            ...result,
            visible: false,
          });
          localStorage.setItem('savedConnections', JSON.stringify(this.savedConnections));
          console.log('Updated savedConnections:', this.savedConnections);
          this.cdr.detectChanges();
        }
        console.log(result);
      });
  }
  showKey: boolean = false;
  showPrefix: boolean = false;
  toggleKeyVisibility() {
    this.showKey = !this.showKey;
  }
  togglePrefixVisibility() {
    this.showPrefix = !this.showPrefix;
  }
//   clearConnections() {
//   this.savedConnections = [];
//   localStorage.removeItem('savedConnections');
// }

}
