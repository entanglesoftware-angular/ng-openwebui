import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
// import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
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
    // private csvParser: NgxCsvParser
  ) {}

  ngOnInit(): void {
    this.parseCsv();
  }

  parseCsv(): void {
    try {
      console.log("CSV ", this.data.csv);
      const csvText = this.data.csv.trim();
      console.log("CSV TEXT ", csvText);
      const lines = csvText.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        this.error = 'CSV is empty.';
        return;
      }

      this.headerRow = lines[0].split(',').map(h => h.trim());
      this.displayedColumns = this.headerRow

      this.dataSource.data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return this.headerRow.reduce((obj, header, idx) => {
          obj[header] = values[idx] || '';
          return obj;
        }, {} as any);
      });
    } catch (err) {
      this.error = 'Failed to parse CSV: ' + (err instanceof Error ? err.message : 'Unknown error');
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
