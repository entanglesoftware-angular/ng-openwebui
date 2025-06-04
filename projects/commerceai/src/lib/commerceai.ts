import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
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
import { ChatPersistenceService } from './services/chat-persistence.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HostListener } from '@angular/core';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | null;
}

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
    Sidebar,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './commerceai.html',
  styleUrl: './commerceai.css',
})
export class Commerceai {
  message: string = '';
  aiName: string = 'CommerceAI';
  domain: string = 'http://localhost:8000';
  models: string[] = ['gpt-3.5-turbo', 'gpt-4', 'gemini-pro', 'llama-3'];
  selectedModel: string = '';
  dropdownOpen: boolean = false;
  chatMessages: ChatMessage[] = [];
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private chatPersistence: ChatPersistenceService
  ) {}

  getToken() {
    const loginData = {
      email: 'alice.smith123@example.com',
      password: 'newsecurepass123',
    };
    this.http
      .post<LoginResponse>(`https://micro-scale.software/api/login`, loginData)
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('jwt', response.JWT_Token);
        },
        error: (err) => {
          console.error('Login error:', err);
        },
      });
  }
  async ngOnInit(): Promise<void> {
    this.models = ['gpt-3.5-turbo', 'gpt-4', 'custom-model'];
    this.selectedModel = this.models[0];
     document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
    if (
      sessionStorage.getItem('jwt') == null ||
      sessionStorage.getItem('jwt') == undefined ||
      sessionStorage.getItem('jwt') == ''
    ) {
      this.getToken();
    }

    try {
      const loadedMessages = await this.chatPersistence.loadMessages();
      this.chatMessages = loadedMessages || [];
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }

    this.http.get<any>(`${this.domain}/v1/models`).subscribe({
      next: (res) => {
        this.models = res?.data?.map((m: any) => m.id) || [];
        this.selectedModel = this.models[0] || '';

        // this.selectedModel = this.models[0] || '';
        // this.aiName = this.selectedModel || 'Unknown AI';

        console.log('Loaded models:', this.models);

        // this.aiName = res?.data?.[0]?.id ?? 'Unknown AI';
        // console.log(res);
      },
      error: (err) => {
        // this.aiName = 'Select Model';
        console.error('Error loading models:', err);
        this.aiName = 'Select Model';
      },
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  selectModel(model: string) {
    this.selectedModel = model;
    this.dropdownOpen = false;
  }
  @HostListener('document:click', ['$event'])
closeDropdownOnOutsideClick(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.model-selector')) {
    this.dropdownOpen = false;
  }
}
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  clearChat(): void {
    this.chatPersistence.clearMessages();
    this.chatMessages = [];
  }

  onSend() {
    const trimmed = this.message.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    this.chatMessages.push(userMessage);
    this.chatPersistence.saveMessage(userMessage);

    this.message = '';

    const body = {
      model: this.aiName,
      messages: [{ role: 'user', content: trimmed }],
      stream: true,
    };

    fetch(`${this.domain}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: sessionStorage.getItem('jwt') || '',
      },
      body: JSON.stringify(body),
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let assistantContent = '';
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
      this.chatMessages.push(assistantMessage);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') return;

          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta;

            if (delta?.content) {
              assistantContent += delta.content;
              assistantMessage.content = assistantContent;
              this.chatPersistence.saveMessage(assistantMessage);
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
