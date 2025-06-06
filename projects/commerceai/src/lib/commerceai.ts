import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { MaterialModule } from './modules/material.module';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sidebar } from './sidebar/sidebar';
import { ChatPersistenceService } from './services/chat-persistence.service'
import { ChatMessage } from './models/chat-message.model';

interface LoginResponse {
  account: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
  JWT_Token: string;
  Refresh_Token: string;
}

@Component({
  selector: 'lib-commerceai',
  imports: [
    MaterialModule,
    FormsModule,
    HttpClientModule,
    NgClass,
    NgForOf,
    MarkdownModule,
    NgIf,
    Sidebar
  ],
  templateUrl: './commerceai.html',
  styleUrl: './commerceai.css',
})


export class Commerceai {
  message: string = '';
  aiName: string = 'CommerceAI';
  domain: string = 'http://localhost:8000';
  chatMessages: ChatMessage[] = [];
  currentSessionId: number | undefined = 0;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private chatPersistence: ChatPersistenceService,
    private cdr: ChangeDetectorRef
  ) { }


  getToken() {
    const loginData = {
      email: 'alice.smith123@example.com',
      password: 'newsecurepass123'
    }
    this.http.post<LoginResponse>(`https://micro-scale.software/api/login`, loginData).subscribe({
      next: (response) => {
        sessionStorage.setItem('jwt', response.JWT_Token);
      },
      error: (err) => {
        console.error('Login error:', err);
      }
    });

  }
  async ngOnInit(): Promise<void> {

    if (sessionStorage.getItem('jwt') == null || sessionStorage.getItem('jwt') == undefined || sessionStorage.getItem('jwt') == '') {
      this.getToken();
    }

    try {
      const userId = 1;
      const loadedSessions = await this.chatPersistence.loadSessions(userId);
      const chatNames = Array.isArray(loadedSessions) ? loadedSessions : [];

      if (chatNames.length === 0 || !chatNames[0]?.sessionId) {
        console.warn('No valid chat sessions found.');
        this.currentSessionId = 0;
        this.chatMessages = [];
      } else{
        const sessionId = chatNames[0].sessionId;
        this.currentSessionId = typeof sessionId === 'number' ? sessionId : 0;
        const loadedMessages = await this.chatPersistence.loadMessages(this.currentSessionId);
        this.chatMessages = Array.isArray(loadedMessages) ? loadedMessages : [];
      }
    } catch (error) {
      console.error('Error loading chat sessions or messages:', error);
      this.currentSessionId = 0;
      this.chatMessages = [];
    }


    this.http.get<any>(`${this.domain}/v1/models`).subscribe({
      next: (res) => {
        this.aiName = res?.data?.[0]?.id ?? 'Unknown AI';
        console.log(res);
      },
      error: () => {
        this.aiName = 'Select Model';
      }
    });
  }

  async onSessionSelected(sessionId: number) {
    this.currentSessionId = sessionId;

    try {
      const messages = await this.chatPersistence.loadMessages(sessionId);
      this.chatMessages = messages || [];
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading messages for session:', err);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  clearChat(): void {
    this.chatPersistence.clearMessages();
    this.chatMessages = [];
  }

  async onSend() {
    const trimmed = this.message.trim();
    if (!trimmed) return;

    if(!this.currentSessionId)
    {
      const userId = 1;
      const newSession = await this.chatPersistence.saveSession(userId);
      this.currentSessionId = newSession.sessionId;
    }
    this.cdr.detectChanges();
    const userMessage: ChatMessage = { role: 'user', content: trimmed, sessionId: this.currentSessionId };
    this.chatMessages.push(userMessage);
    this.chatPersistence.saveMessage(userMessage);

    this.message = '';

    const body = {
      model: this.aiName,
      messages: [{ role: 'user', content: trimmed }],
      stream: true
    };

    fetch(`${this.domain}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': sessionStorage.getItem('jwt') || ""
      },
      body: JSON.stringify(body)
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let assistantContent = '';
      const assistantMessage: ChatMessage = { role: 'assistant', content: '', sessionId: this.currentSessionId };

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') {
            this.chatMessages.push(assistantMessage);
            this.chatPersistence.saveMessage(assistantMessage);
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta;

            if (delta?.content) {
              assistantContent += delta.content;
              assistantMessage.content = assistantContent;
            }
          } catch (e) {
            console.error('Error parsing stream chunk', e);
          }
        }
      }
    });
  }

}

export * from './services/chat-persistence.service';
export * from './models/chat-message.model';
export * from './models/chat-session.model';
