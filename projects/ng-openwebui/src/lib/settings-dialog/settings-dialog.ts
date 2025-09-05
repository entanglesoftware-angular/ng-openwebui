import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgFor, NgIf, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ConnectionDialogComponent } from '../connection-dialog/connection-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { UserService } from '../user.service';
import { NgOpenwebUIThemeService } from '../theme/theme.service';
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

  private readonly cookieKey = 'savedConnections';
  private isBrowser: boolean;

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    public themeService: NgOpenwebUIThemeService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Load saved connections safely from cookies
    this.savedConnections = this.getConnectionsFromCookie();

    // Load user data
    this.user = this.userService.getUser() ?? {};
    console.log('User:', this.userService.getUser());

    // Load current theme
    const theme = this.themeService.getCurrentTheme();
    this.currentTheme = theme ? theme : 'light-theme';
  }

  changeTheme(theme: string) {
    this.currentTheme = theme || 'light-theme';
    this.themeService.setTheme(theme as 'light-theme' | 'dark-theme');

    if (this.isBrowser) {
      this.document.cookie = `ca-theme=${theme}; path=/; max-age=31536000`; // 1 year
    }
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

  private updateStorage() {
    if (!this.isBrowser) return;
    const encodedData = encodeURIComponent(JSON.stringify(this.savedConnections));
    this.document.cookie = `${this.cookieKey}=${encodedData}; path=/; max-age=31536000`; // 1 year
  }

  private getConnectionsFromCookie(): any[] {
    if (!this.isBrowser) return [];

    const cookies = this.document.cookie.split(';').map(c => c.trim());
    const savedCookie = cookies.find(c => c.startsWith(`${this.cookieKey}=`));

    if (!savedCookie) return [];

    try {
      const value = decodeURIComponent(savedCookie.split('=')[1]);
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
}
