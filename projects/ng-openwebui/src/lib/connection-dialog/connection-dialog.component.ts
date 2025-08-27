import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../modules/material.module';
import { ConnectionFormComponent } from '../connection-form/connection-form.component'

@Component({
  selector: 'app-connection-dialog',
  templateUrl: './connection-dialog.component.html',
  imports: [MaterialModule, ConnectionFormComponent]
})
export class ConnectionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConnectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', connection?: any }
  ) {}

  onSave(connectionData: any) {
    this.dialogRef.close(connectionData);
  }

  onDelete() {
    this.dialogRef.close({ delete: true });
  }

  onClose() {
    this.dialogRef.close({ close: true });
  }
}
