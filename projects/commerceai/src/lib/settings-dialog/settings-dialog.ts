import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ConnectionDialogComponent } from '../connection-dialog/connection-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { UserService } from '../user.service';
import { CommerceAiThemeService } from '../theme/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-dialog',
  imports: [MatIcon, NgIf, NgFor, MatCard, MatDialogModule, FormsModule],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
})
export class SettingsDialog {
  user: { name?: string; email?: string; initial?: string } = {};
  currentTheme: string = 'light-theme';
  selectedSection = 'general';
  savedConnections: any[] = [];
  showKey: boolean = false;
  showPrefix: boolean = false;

  constructor(private dialog: MatDialog, private cdr: ChangeDetectorRef, private userService: UserService, public themeService: CommerceAiThemeService) { }

  ngOnInit(): void {
    const data = localStorage.getItem('savedConnections');
    this.savedConnections = data ? JSON.parse(data) : [];
    this.user = this.userService.getUser();
    const theme = this.themeService.getCurrentTheme();
    this.currentTheme = theme ? theme : 'light-theme';
  }

  changeTheme(theme: string) {
    this.currentTheme = theme ? theme : 'light-theme';
    this.themeService.setTheme(theme as 'light-theme' | 'dark-theme');
  }

  toggleKeyVisibility() {
    this.showKey = !this.showKey;
  }

  togglePrefixVisibility() {
    this.showPrefix = !this.showPrefix;
  }

  openAddDialog() {
    this.dialog.open(ConnectionDialogComponent, {
      data: { mode: 'add' }
    }).afterClosed().subscribe(result => {
      if (result && !result.close) {
        this.savedConnections.push({ ...result, visible: false });
        this.updateStorage();
      }
    });
  }

  openEditDialog(connection: any) {
    this.dialog.open(ConnectionDialogComponent, {
      data: { mode: 'edit', connection }
    }).afterClosed().subscribe(result => {
      const index = this.savedConnections.indexOf(connection);
      if (result?.delete && index > -1) {
        this.savedConnections.splice(index, 1);
      } else if (result && index > -1) {
        this.savedConnections[index] = result;
      }
      this.updateStorage();
    });
  }

  updateStorage() {
    localStorage.setItem('savedConnections', JSON.stringify(this.savedConnections));
  }
}
