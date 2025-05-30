import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { MaterialModule } from './modules/material.module';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sidebar } from './sidebar/sidebar';


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
    Sidebar
  ],
  template: `
    <div class="main-container">
      <lib-sidebar></lib-sidebar>
      <div class="chat-box-container">
        <div class="chat-box-container">
          <mat-card class="ai-name">{{ aiName }}</mat-card>

          <div class="chat-messages" #chatContainer>
            <mat-card
              *ngFor="let msg of chatMessages"
              class="message"
              [ngClass]="{ 'user': msg.role === 'user', 'assistant': msg.role === 'assistant' }"
            >
              <!--            {{msg.content}}-->
              <div *ngIf="msg.role === 'user'">{{ msg.content }}</div>
              <markdown *ngIf="msg.role === 'assistant'" [data]="msg.content"></markdown>
            </mat-card>
          </div>

          <mat-card
            class="chat-input-container"
          >
            <mat-form-field class="chat-input" appearance="outline">
              <input
                matInput
                placeholder="Type a message..."
                [(ngModel)]="message"
                (keyup.enter)="onSend()"
              />
            </mat-form-field>

            <button
              mat-icon-button
              color="primary"
              class="send-button"
              (click)="onSend()"
              [disabled]="!message.trim()"
            >
              <mat-icon>send</mat-icon>
            </button>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .main-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .chat-box-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: gainsboro;
    }

  .ai-name {

    flex: 0 0 auto;
    padding: 16px;
    font-size: 25px;
    font-weight: 500;
    background-color: white;
    position: sticky;
    top: 0;
    border-bottom: 1px solid black;
    z-index: 1;
  }

  .chat-messages {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  .message {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 16px;
    font-size: 16px;
    line-height: 1.4;
    word-break: break-word;
  }

  .message.user {
    align-self: flex-end;
    background-color: #bc3624;
    color: white;
  }

  .message.assistant {
    align-self: flex-start;
    background-color: white;
    color: #1c244e;
  }

  mat-card {
    display: flex;
    flex-direction: row;
    border-color: black;
    background-color: white;
    color: black;
  }

  .send-button{
    cursor: pointer;
  }
  .chat-input-container {
    display: flex;
    align-items: baseline;
    padding: 8px;
    padding-bottom: 0px;
    margin-left: 18px;
    margin-right: 18px;
    margin-bottom: 20px;
    border-radius: 12px;
    position: sticky;
    margin-top: auto;
  }

  .chat-input {
    color: black !important;
    border-color: black;
    border-width: 10px;
    flex: 1;
    margin-right: 8px;

  }
  .chat-input.mat-form-field.appearance-outline {
    .mat-form-field-outline-start,
    .mat-form-field-outline-end,
    .mat-form-field-outline-gap {
      border: 3px solid black !important;
    }

    &.mat-focused {
      .mat-form-field-outline-start,
      .mat-form-field-outline-end,
      .mat-form-field-outline-gap {
        border: 6px solid black !important;
      }
    }
  }
  markdown {
    overflow-x: auto;
    display: block;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
  }
  `
})


export class Commerceai {
  message: string = '';
  aiName: string = 'CommerceAI';
  domain: string = 'http://localhost:8000';
  chatMessages: ChatMessage[] = [];
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) { }


  getToken(){
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
  ngOnInit(): void {

    if (sessionStorage.getItem('jwt') == null || sessionStorage.getItem('jwt') == undefined || sessionStorage.getItem('jwt') == '') {
      this.getToken();
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

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  onSend() {
    const trimmed = this.message.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    this.chatMessages.push(userMessage);

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
            }
          } catch (e) {
            console.error('Error parsing stream chunk', e);
          }
        }
      }
    });
  }

}
