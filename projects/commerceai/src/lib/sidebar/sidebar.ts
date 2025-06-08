import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgForOf, NgIf } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { ChatSession } from '../models/chat-session.model';
import { SelectedSessionService } from '../services/selected-session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError, Subscription } from 'rxjs';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [MaterialModule, NgForOf, NgIf, CommonModule, HttpClientModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatNames: ChatSession[] = [];
  private newSessionSubscription: Subscription;
  constructor(
    private http: HttpClient,
    private selectedSessionService: SelectedSessionService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.newSessionSubscription = this.selectedSessionService.newSessionCreated$.subscribe(() => {
      this.loadSessions();
    })
  }

  async ngOnInit() {
    await this.loadSessions();
  }

  async loadSessions() {
    const userId = 'entangle';
    const headers = new HttpHeaders({
      user_id: userId,
      authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
    });

    try {
      const response = await this.http
        .get<{ sessions: ChatSession[] }>('http://localhost:8000/sessions/get', { headers })
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
    // Nullify the current session to enter "new chat" state
    this.selectedSessionService.setSessionId(null);
    this.cdr.detectChanges();
  }

  onSelectSession(session: ChatSession) {
    if (session.id) {
      this.selectedSessionService.setSessionId(session.id);
    }
  }
}
