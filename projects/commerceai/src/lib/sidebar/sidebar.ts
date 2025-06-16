import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgForOf, NgIf } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { ChatSession } from '../models/chat-session.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {CommerceAIConfig } from '../config/commerceai-config';
import { CommerceAIConfigValidator } from '../services/commerceai-config-validator.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [MaterialModule, NgForOf, NgIf, CommonModule, HttpClientModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {
  chatNames: ChatSession[] = [];
  selectedSessionId: string | null = null;
  private config: CommerceAIConfig;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private configValidator: CommerceAIConfigValidator
  ) {
    this.config = this.configValidator.getConfig();
  }

  ngOnInit() {
    this.loadSessions();
    this.route.params.subscribe(params => {
      this.selectedSessionId = params['session_id'] || null;
      this.cdr.detectChanges();
    });
  }

  async loadSessions() {
    const userId = 'entangle';
    const headers = new HttpHeaders({
      user_id: this.config.userId,
      authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
    });

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
    this.router.navigate(['..'], { relativeTo: this.route }); // Navigate to new chat
    this.cdr.detectChanges();
  }

  onSelectSession(session: ChatSession) {
    if (session.id) {
      this.router.navigate([session.id], { relativeTo: this.route.parent });
    }
  }

  ngOnDestroy() {}
}
