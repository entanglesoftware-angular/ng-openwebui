import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from '../modules/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-connection-form',
  templateUrl: './connection-form.component.html',
  styleUrls: ['./connection-form.component.css'],
  imports: [MaterialModule, ReactiveFormsModule, NgIf]
})
export class ConnectionFormComponent implements OnInit {
  @Input() initialData: any = {};
  @Input() showDelete: boolean = false;

  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  showKey = false;
  showPrefix = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      url: [this.initialData?.url || '', Validators.required],
      key: [this.initialData?.key || '', Validators.required],
      prefixId: [this.initialData?.prefixId || ''],
      modelId: [this.initialData?.modelId || ''],
    });
  }

  toggleKeyVisibility(): void {
    this.showKey = !this.showKey;
  }

  togglePrefixVisibility(): void {
    this.showPrefix = !this.showPrefix;
  }

  onSave(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  onDelete(): void {
    this.delete.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
