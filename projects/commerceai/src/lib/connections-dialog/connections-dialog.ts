import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lib-connections-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIcon,
  ],
  templateUrl: './connections-dialog.html',
  styleUrl: './connections-dialog.css',
})
export class ConnectionsDialog {
  apiUrl = '';
  apikey = '';
  prefixID = '';
  modelId = '';
  showKey: boolean = false;
  showPrefix: boolean = false;

  constructor(public dialogRef: MatDialogRef<ConnectionsDialog>) {}

  toggleKeyVisibility() {
    this.showKey = !this.showKey;
  }
  togglePrefixVisibility() {
    this.showPrefix = !this.showPrefix;
  }

  addModelId() {}

  savedConnections: any[] = [];

  saveConnection() {
    const connectionData = {
      key: this.apikey,
      url: this.apiUrl,
    };

    this.dialogRef.close(connectionData); 
  }
}
