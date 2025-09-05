import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostListener,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NgForOf, NgIf } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { ChatSession } from '../models/chat-session.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgOpenwebUIConfig } from '../config/ng-openwebui-config';
import { NgOpenwebUIConfigValidator } from '../services/ng-openwebui-config-validator.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [MaterialModule, NgForOf, NgIf, CommonModule, HttpClientModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  chatNames: ChatSession[] = [];
  selectedSessionId: string | null = null;
  private config: NgOpenwebUIConfig;
  menuOpen = false;
  menuPosition = { x: 0, y: 0 };
  selectedSession: any = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private configValidator: NgOpenwebUIConfigValidator,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.config = this.configValidator.getConfig();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.loadSessions();
    this.route.params.subscribe(params => {
      this.selectedSessionId = params['session_id'] || null;
      this.cdr.detectChanges();
    });
  }

  async loadSessions() {
    const headers = this.buildHeaders();
    try {
      const response = await this.http
        .get<{ sessions: ChatSession[] }>(`${this.config.domain}/sessions/get`, { headers })
        .pipe(
          catchError((err) => {
            console.error('Failed to load sessions:', err);
            this.snackBar.open('Failed to load chat sessions.', 'Close', { duration: 3000 });
            return throwError(() => err);
          })
        )
        .toPromise();

      this.chatNames = response?.sessions || [];
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error fetching sessions:', err);
      this.snackBar.open('Error fetching sessions.', 'Close', { duration: 3000 });
    }
  }

  addNewChat() {
    const userId = this.route.snapshot.paramMap.get('user_id');
      if(userId){
        this.router.navigate([userId], { relativeTo: this.route.parent });
      }
      else {
        this.router.navigate(['..'], { relativeTo: this.route.parent });
      }
    this.cdr.detectChanges();
  }

  onSelectSession(session: ChatSession) {
    const userId = this.route.snapshot.paramMap.get('user_id');
    let nav: string[] = [];
    if (userId) {
      nav.push(userId);
    }
    if (session.id) {
      nav.push(session.id);
    }
    console.log(nav);
    if (nav.length > 0) {
      this.router.navigate(nav, { relativeTo: this.route.parent });
    }
  }

  openMenu(event: MouseEvent, session: any) {
    event.stopPropagation();
    this.clearActiveListItems();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('hover-btn');
    element.closest('mat-list-item')?.classList.add('active');
    const button = element.getBoundingClientRect();
    this.menuPosition = { x: button.left, y: button.bottom };
    this.menuOpen = true;
    this.selectedSession = session;
  }

  async delete(session: any) {
    try {
      const headers = this.buildHeaders();
      const response = await this.http
        .delete<{ status: string; message?: string }>(`${this.config.domain}/session/delete/${session.id}`, { headers })
        .pipe(
          catchError((err) => {
            console.error('HTTP error while deleting session:', err);
            this.snackBar.open('Failed to delete chat session.', 'Close', { duration: 3000 });
            return throwError(() => err);
          })
        )
        .toPromise();

      if (response?.status !== 'error') {
        this.snackBar.open('Chat session deleted successfully.', 'Close', { duration: 3000 });
        const userId = this.route.snapshot.paramMap.get('user_id');
        if (userId) {
          this.router.navigate([userId], { relativeTo: this.route.parent });
        } else {
          this.router.navigate(['..'], { relativeTo: this.route });
        }
        this.cdr.detectChanges();
      } else {
        console.error('Server responded with error:', response?.message);
        this.snackBar.open(`Error: ${response?.message || 'Unknown error'}`, 'Close', { duration: 3000 });
      }
    } catch (err) {
      console.error('Unexpected error while deleting session:', err);
      this.snackBar.open('Unexpected error occurred.', 'Close', { duration: 3000 });
    }
    this.menuOpen = false;
    this.clearActiveListItems();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.menuOpen = false;
    this.clearActiveListItems();
  }

  clearActiveListItems() {
    if (!this.isBrowser) return;
    const activeItems = this.document.querySelectorAll('mat-list-item.active');

    activeItems.forEach((item) => {
      const buttons = item.querySelectorAll('button');
      buttons.forEach((button) => {
        button.classList.remove('hover-btn');
      });
      item.classList.remove('active');
    });
  }

  /** ✅ Updated to be SSR Safe */
  private buildHeaders(additionalHeaders: { [key: string]: string } = {}): HttpHeaders {
    const jwt = this.isBrowser ? sessionStorage.getItem('jwt') || '' : '';
    const headers: { [key: string]: string } = {
      user_id: this.config.userId,
      authorization: `Bearer ${jwt}`,
      ...additionalHeaders
    };
    return new HttpHeaders(headers);
  }

  ngOnDestroy() {}
}
