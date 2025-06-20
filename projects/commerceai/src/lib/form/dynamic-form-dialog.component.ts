import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../modules/material.module';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'lib-dynamic-form-dialog',
  templateUrl: './dynamic-form-dialog.component.html',
  styleUrl: './dynamic-form-dialog.component.css',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    NgIf,
  ],
})
export class DynamicFormDialogComponent implements OnInit {
  form!: FormGroup;
  fields: string[] = [];
  sheetName = '';
  user = '';

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DynamicFormDialogComponent>
  ) {}

  ngOnInit(): void {
    const formGroup: any = {};
    const item = this.data.data[0];

    this.fields = item.fields;
    this.sheetName = item.sheet;
    this.user = item.user;

    this.fields.forEach(field => {
      formGroup[field] = [''];
    });

    this.form = this.fb.group(formGroup);
  }

  submitForm(): void {
    console.log('Submitted Data:', this.form.value);
    this.dialogRef.close(this.form.value);
  }
}
