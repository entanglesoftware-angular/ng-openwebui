import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgOpenwebui } from './ng-openwebui';
import { Sidebar } from './sidebar/sidebar';
import { CommerceaiRoutingModule } from './ng-openwebui-routing.module';
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
    CommerceaiRoutingModule,
    NgOpenwebui,
    Sidebar,
    DynamicFormDialogComponent,
    CsvPreviewDialogComponent,
  ],
  exports: [NgOpenwebui, Sidebar, CommerceaiRoutingModule],
})
export class CommerceaiModule {}
