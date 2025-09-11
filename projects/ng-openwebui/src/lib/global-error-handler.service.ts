import { ErrorHandler, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private isBrowser: boolean;

  constructor(
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  handleError(error: any): void {
    console.error('Global Error:', error);
    if (this.isBrowser) {
      this.snackBar.open('An unexpected error occurred. Please try again.', 'Close', {
        duration: 4000,
        panelClass: ['lib-snackbar']
      });
    }
  }
}