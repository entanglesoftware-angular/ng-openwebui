import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../modules/material.module';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'lib-dynamic-form-dialog',
    standalone: true,
    templateUrl: './dynamic-form-dialog.component.html',
    styleUrls: ['./dynamic-form-dialog.component.css'],
    imports: [
        MaterialModule,
        ReactiveFormsModule,
        CommonModule,
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
    ) { }

    ngOnInit(): void {
        const item = typeof this.data === 'string' ? JSON.parse(this.data) : this.data;
        if (!item) {
            console.warn('No data provided to dialog.');
            return;
        }

        this.fields = item.fields || [];
        this.sheetName = item.sheet_name || '';
        this.user = item.user_id || '';

        const formGroup: Record<string, any> = {};

        this.fields.forEach(field => {
            const key = field;
            formGroup[key] = [''];
        });

        this.form = this.fb.group(formGroup);
    }


    public normalizeFieldName(field: string): string {
        return field.trim().toLowerCase().split(' ')[0];
    }

    submitForm(): void {
        this.dialogRef.close(this.form.value);
    }

    onCloseClick(): void {
        this.dialogRef.close({ closedByUser: true });
    }

    isAnyFieldFilled(): boolean {
        return Object.values(this.form.value).some(value =>
            typeof value === 'string' ? value.trim() !== '' : !!value
        );
    }
}
