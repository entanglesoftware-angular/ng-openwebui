import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Inject } from '@angular/core';

@Component({
  selector: 'lib-edit-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './edit-dialog.html',
  styleUrls: ['./edit-dialog.css'],
})
export class EditDialog {
  form!: FormGroup;
  hideKey = true;
  enabled!: boolean;

  constructor(
  public dialogRef: MatDialogRef<EditDialog>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private fb: FormBuilder
) {
  this.form = this.fb.group({
    url: [this.data?.url || '', Validators.required],
    key: [this.data?.key || '', Validators.required],
    prefixId: [this.data?.prefixId || ''],
    modelId: [this.data?.modelId || ''],
  });

  this.enabled = this.data?.enabled ?? false;
}


 onSave() {
  if (this.form.valid) {
    this.dialogRef.close({
      ...this.form.value,
      enabled: this.enabled  
    });
  }
}

  onDelete() {
    this.dialogRef.close({ delete: true });
  }
  
}
