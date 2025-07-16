import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ConnectionsDialog } from '../connections-dialog/connections-dialog';
import { ChangeDetectorRef } from '@angular/core';
import { EditDialog } from '../edit-dialog/edit-dialog';
import { MatCard } from '@angular/material/card';
import { UserService } from '../user.service';
import { CommerceAiThemeService } from '../theme/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-dialog',
  imports: [MatIcon, NgIf, NgFor, MatCard, MatDialogModule,FormsModule],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.css',
})
export class SettingsDialog {
  user: { name?: string; email?: string; initial?: string } = {};
  currentTheme: string = 'light-theme';
  ngOnInit(): void {
    const data = localStorage.getItem('savedConnections');
    if (data) {
      this.savedConnections = JSON.parse(data);
    }
    this.user = this.userService.getUser();
    const theme = this.themeService.getCurrentTheme();
    this.currentTheme = theme ? theme : 'light-theme';
  }
  constructor(private dialog: MatDialog, private cdr: ChangeDetectorRef, private userService: UserService, public themeService: CommerceAiThemeService) { }

  selectedSection = 'general';

  savedConnections: any[] = [];

  changeTheme(theme: string) {
    this.currentTheme = theme ? theme : 'light-theme';
    this.themeService.setTheme(theme as 'light-theme' | 'dark-theme');
  }

  onClick() {
    this.dialog
      .open(ConnectionsDialog)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log('Received from dialog:', result);
          this.savedConnections.push({
            ...result,
            visible: false,
          });
          localStorage.setItem(
            'savedConnections',
            JSON.stringify(this.savedConnections)
          );
          console.log('Updated savedConnections:', this.savedConnections);
          this.cdr.detectChanges();
        }
        console.log(result);
      });
  }
  showKey: boolean = false;
  showPrefix: boolean = false;
  toggleKeyVisibility() {
    this.showKey = !this.showKey;
  }
  togglePrefixVisibility() {
    this.showPrefix = !this.showPrefix;
  }
  onEdit(conn: any) {
    this.dialog
      .open(EditDialog, {
        width: '500px',
        data: {
          url: conn.url || '',
          key: conn.key || '',
          prefixId: conn.prefixId || '',
          modelId: conn.modelId || '',
          enabled: conn.visible ?? false,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        const index = this.savedConnections.findIndex(
          (c) => c.url === conn.url
        );

        if (result?.delete && index > -1) {
          this.savedConnections.splice(index, 1);
          localStorage.setItem(
            'savedConnections',
            JSON.stringify(this.savedConnections)
          );
          this.cdr.detectChanges();
        } else if (result && index > -1) {
          this.savedConnections[index] = {
            ...this.savedConnections[index],
            url: result.url,
            key: result.key,
            prefixId: result.prefixId,
            modelId: result.modelId,
            visible: result.enabled,
          };
          localStorage.setItem(
            'savedConnections',
            JSON.stringify(this.savedConnections)
          );
          this.cdr.detectChanges();
        }
      });
  }
}
