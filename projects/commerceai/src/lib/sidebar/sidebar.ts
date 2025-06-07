import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common';
import { NgForOf, NgIf } from '@angular/common';
import { MaterialModule } from '../modules/material.module';
import { ChatSession } from '../models/chat-session.model';
import { SelectedSessionService } from '../services/selected-session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import {MatLine} from "@angular/material/core";

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [
    MaterialModule,
    NgForOf,
    NgIf,
    CommonModule,
    HttpClientModule,
    MatLine,
    // Added HttpClientModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatNames: ChatSession[] = [];

  constructor(
      private http: HttpClient,
      private selectedSessionService: SelectedSessionService,
      private cdr: ChangeDetectorRef,
      private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadSessions();
  }

  async loadSessions() {
    const userId = 'entangle'; // Replace with dynamic user ID if needed
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
      if (this.chatNames.length > 0 && this.chatNames[0]?.id) {
        this.selectedSessionService.setSessionId(this.chatNames[0].id);
      }
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error fetching sessions:', err);
      this.snackBar.open('Error fetching sessions.', 'Close', { duration: 3000 });
    }
  }

  async addNewChat() {
    const userId = 'entangle'; // Replace with dynamic user ID if needed
    const headers = new HttpHeaders({
      user_id: userId,
      authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
    });

    try {
      const newSession = await this.http
          .post<ChatSession>('http://localhost:8000/sessions/create', {}, { headers })
          .toPromise();

      if (newSession && newSession.id) {
        this.chatNames = [newSession, ...this.chatNames];
        this.selectedSessionService.setSessionId(newSession.id);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid session response from server');
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
      this.snackBar.open('Failed to create new chat session.', 'Close', { duration: 3000 });
    }
  }

  onSelectSession(session: ChatSession) {
    if (session.id) {
      this.selectedSessionService.setSessionId(session.id);
    }
  }
}
