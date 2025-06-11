import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MaterialModule } from './modules/material.module';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sidebar } from './sidebar/sidebar';
import { ChatReq, ChatReqMessage, Events, event, EventMessage } from './models/chat-message.model';
import { ChatSession } from './models/chat-session.model';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormDialogComponent } from './form/dynamic-form-dialog.component';
import { CsvPreviewDialogComponent } from './csv-preview-dialog/csv-preview-dialog.component';
import { SelectedSessionService } from './services/selected-session.service';
import { Subscription } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'lib-commerceai',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    NgClass,
    NgForOf,
    MarkdownModule,
    NgIf,
    Sidebar,
    HttpClientModule,
    MatTooltip,
  ],
  templateUrl: './commerceai.html',
  styleUrl: './commerceai.css',
})

export class Commerceai implements OnInit, AfterViewChecked, OnDestroy {
  message: string = '';
  aiName: string = 'CommerceAI';
  domain: string = 'http://localhost:8000';
  chatMessages: Events = { events: [] };
  currentSessionId: string | null = null;
  userId: string = 'entangle';
  selectedFiles: File[] = [];

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private sessionSubscription: Subscription;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private selectedSessionService: SelectedSessionService
  ) {
    this.sessionSubscription = this.selectedSessionService.selectedSessionId$.subscribe((sessionId) => {
      if (sessionId) {
        this.onSessionSelected(sessionId);
      } else {
        this.currentSessionId = null;
        this.chatMessages.events = [];
        this.cdr.detectChanges();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.http
      .get<any>(`${this.domain}/v1/models`, {
        headers: new HttpHeaders({
          user_id: this.userId,
          authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
        }),
      })
      .subscribe({
        next: (res) => {
          this.aiName = res?.data?.[0]?.id ?? 'Unknown AI';
          console.log(res);
        },
        error: () => {
          this.aiName = 'Select Model';
          this.snackBar.open('Failed to fetch model name.', 'Close', { duration: 3000 });
        },
      });
  }

  async onSessionSelected(sessionId: string) {
    console.log('[DEBUG] onSessionSelected called with prev session id:', this.currentSessionId);
    console.log('[DEBUG] array:', this.chatMessages.events);
    this.currentSessionId = sessionId;
    console.log('[DEBUG] onSessionSelected called with sessionId:', this.currentSessionId);
    console.log('[DEBUG] array:', this.chatMessages.events);

    this.chatMessages.events = [];
    try {
      const headers = new HttpHeaders({
        user_id: this.userId,
      });
      const response = await this.http
        .get<Events>(`${this.domain}/session/${sessionId}`, { headers })
        .toPromise();
      this.chatMessages.events = (response?.events || []).map((msg) => ({
        ...msg,
        sessionId,
      }));
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading messages for session:', err);
      this.snackBar.open('Failed to load messages.', 'Close', { duration: 3000 });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  clearChat(): void {
    this.chatMessages.events = [];
    if (this.currentSessionId) {
      const headers = new HttpHeaders({
        user_id: this.userId,
        authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
      });
      this.http
        .delete(`${this.domain}/session/${this.currentSessionId}/messages`, { headers })
        .toPromise()
        .catch((err) => {
          console.error('Error clearing messages:', err);
          this.snackBar.open('Failed to clear messages.', 'Close', { duration: 3000 });
        });
    }
    this.cdr.detectChanges();
  }

  checkForFormTrigger(message: string | null) {
    if (message && message.includes('add product form')) {
      const formData = {
        data: [
          {
            user: 'epv',
            sheet: 'EPV Trade Price List 03-June-2025',
            fields: ['Category', 'Country', 'Price'],
          },
        ],
      };
      this.openDynamicForm(formData);
    }
  }

  openDynamicForm(formData: any): void {
    this.dialog.open(DynamicFormDialogComponent, {
      width: '600px',
      data: formData,
    });
  }

  openCsvDialog(csvString: string): void {
    this.dialog.open(CsvPreviewDialogComponent, {
      width: '70vw', // 70% of viewport width
      maxHeight: '80vh', // Optional: limit height to 80% of viewport height
      panelClass: 'csv-dialog-panel',
      data: {
        csv: csvString,
      }
    });
  }

  async onSend() {
    const trimmed = this.message.trim();
    if (!trimmed && this.selectedFiles.length === 0) return;

    let sessionId = this.currentSessionId;
    let isNewSession = false;
    if (!sessionId) {
      try {
        const headers = new HttpHeaders({
          user_id: this.userId,
        });
        const newSession = await this.http
          .post<ChatSession>(`${this.domain}/session/create`, {}, { headers })
          .toPromise();
        console.log('New session created 1:', newSession, this.chatMessages.events);
        if (newSession && newSession.id) {
          sessionId = newSession.id;
          this.currentSessionId = sessionId;
          isNewSession = true;
          this.selectedSessionService.setSessionId(sessionId);
        } else {
          throw new Error('Invalid session response from server');
        }
      } catch (err) {
        console.error('Failed to create new session:', err);
        this.snackBar.open('Failed to create new session.', 'Close', { duration: 3000 });
        return;
      }
    }
    console.log('New session created 2:', this.chatMessages.events);

    if (trimmed) {
      const eventMessage: EventMessage = {
        type: "text",
        content: trimmed,
      };
      const userMessage: event = {
        role: 'user',
        messages: [eventMessage],
      };
      console.log('New session created 3 :', this.chatMessages.events);

      this.chatMessages.events.push(userMessage);
      console.log('New session created 4 :', this.chatMessages.events);

      this.cdr.detectChanges();
      console.log('New session created 5 :', this.chatMessages.events);
    }
    console.log('New session created 6 :', this.chatMessages.events);

    this.message = '';

    const ReqBody: ChatReq = {
      model: this.aiName,
      messages: [],
      stream: true,
    };

    if (trimmed) {
      const userMessage: ChatReqMessage = {
        role: 'user',
        type: 'text',
        content: trimmed,
      };
      ReqBody.messages.push(userMessage);
    }

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (const file of this.selectedFiles) {
        try {
          const content = await this.convertFileToBase64(file);
          const mimeType = file.type || 'application/octet-stream';
          const userFile: ChatReqMessage = {
            role: 'user',
            type: mimeType,
            content,
          };
          ReqBody.messages.push(userFile);

          // Add file message to chatMessages for UI display
          const fileEventMessage: EventMessage = {
            type: mimeType,
            content,
          };
          const fileUserMessage: event = {
            role: 'user',
            messages: [fileEventMessage],
          };
          this.chatMessages.events.push(fileUserMessage);
          this.cdr.detectChanges();
        } catch (error) {
          console.error(`Failed to convert file ${file.name}:`, error);
          this.snackBar.open(`Failed to attach file: ${file.name}`, 'Close', { duration: 3000 });
        }
      }
    }
    this.clearAllFiles();
    console.log('New session created 7:', this.chatMessages.events);

    try {
      const response = await fetch(`${this.domain}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          user_id: this.userId,
          session_id: sessionId,
        },
        body: JSON.stringify(ReqBody),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let modelContent = '';
      const eventMessage: EventMessage = {
        type: "text",
        content: modelContent,
      };
      const modelMessage: event = {
        role: 'model',
        messages: [eventMessage],
      };
      console.log('New session created 8:', this.chatMessages.events);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) {
          if (modelContent) {
            const tempMessage: EventMessage = {
              type: "text",
              content: modelContent,
            };
            modelMessage.messages = [tempMessage];
            this.chatMessages.events.push(modelMessage);
            if (isNewSession) {
              this.selectedSessionService.notifyNewSessionCreated();
            }
          }
          this.cdr.detectChanges();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') {
            if (modelContent) {
              const tempMessage: EventMessage = {
                type: "text",
                content: modelContent,
              };
              modelMessage.messages = [tempMessage];
              this.chatMessages.events.push(modelMessage);
              if (isNewSession) {
                this.selectedSessionService.notifyNewSessionCreated();
              }
            }
            this.cdr.detectChanges();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta;

            if (delta?.content) {
              modelContent += delta.content;
              const tempMessage: EventMessage = {
                type: "text",
                content: modelContent,
              };
              modelMessage.messages = [tempMessage];
              this.cdr.detectChanges();
            }
          } catch (e) {
            console.error('Error parsing stream chunk', e);
          }
        }
      }
      console.log('New session created 9:', this.chatMessages.events);

    } catch (err) {
      console.error('Error sending message:', err);
      this.snackBar.open('Failed to send message.', 'Close', { duration: 3000 });
    }
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.snackBar.open(`${this.selectedFiles.length} file(s) selected.`, 'Close', {
        duration: 2000,
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearAllFiles(): void {
    this.selectedFiles = [];
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
  }
}
