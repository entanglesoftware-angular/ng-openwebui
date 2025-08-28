import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgOpenwebUI } from './ng-openwebui';
import { Sidebar } from './sidebar/sidebar';
import { NgOpenwebUIRoutingModule } from './ng-openwebui-routing.module';
import { MaterialModule } from './modules/material.module';
import { DynamicFormDialogComponent } from './form/dynamic-form-dialog.component';
import { CsvPreviewDialogComponent } from './csv-preview-dialog/csv-preview-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MarkdownModule.forRoot(),
    BrowserAnimationsModule,
    MaterialModule,
    NgOpenwebUIRoutingModule,
    NgOpenwebUI,
    Sidebar,
    DynamicFormDialogComponent,
    CsvPreviewDialogComponent,
  ],
  exports: [NgOpenwebUI, Sidebar, NgOpenwebUIRoutingModule],
})
export class NgOpenwebUIModule {}
