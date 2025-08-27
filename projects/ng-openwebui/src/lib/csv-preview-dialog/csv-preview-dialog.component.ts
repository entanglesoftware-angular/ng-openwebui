import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
// import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { Papa } from 'ngx-papaparse'
import {
  MatCell, MatCellDef, MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-csv-preview-dialog',
  templateUrl: './csv-preview-dialog.html',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatTable,
    NgIf,
    MatDialogActions,
    MatButton,
    MatRow,
    MatHeaderRow,
    MatCell,
    MatHeaderCell,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    NgForOf,
    MatColumnDef
  ],
  styleUrl: './csv-preview-dialog.css',
})
export class CsvPreviewDialogComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]); // Explicit type annotation
  displayedColumns: string[] = [];
  headerRow: string[] = [];
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { csv: string },
    private dialogRef: MatDialogRef<CsvPreviewDialogComponent>,
    private papa: Papa
    // private csvParser: NgxCsvParser
  ) {}

  ngOnInit(): void {
    this.parseCsv();
  }

  parseCsv(): void {
    try {
      const trimmed = this.data.csv.trim();
      this.papa.parse(trimmed, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors && result.errors.length > 0) {
            this.error = 'CSV parse error: ' + result.errors[0].message;
            return;
          }
          this.headerRow = result.meta.fields || [];
          this.displayedColumns = this.headerRow;
          this.dataSource.data = result.data as any[];
        }
      });
    } catch (err) {
      this.error = 'Failed to parse CSV: ' + (err instanceof Error ? err.message : 'Unknown error');
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
