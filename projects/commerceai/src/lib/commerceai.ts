import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewChecked,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { MaterialModule } from './modules/material.module';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Import HttpClientModule
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sidebar } from './sidebar/sidebar';
import { ChatMessage } from './models/chat-message.model';
import { ChatSession } from './models/chat-session.model';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormDialogComponent } from './form/dynamic-form-dialog.component';
import { SelectedSessionService } from './services/selected-session.service';
import { Subscription } from 'rxjs';

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

interface SessionResponse {
    response: ChatMessage[];
}

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
        HttpClientModule, // Added HttpClientModule
    ],
    templateUrl: './commerceai.html',
    styleUrl: './commerceai.css',
})
export class Commerceai implements OnInit, AfterViewChecked, OnDestroy {
    message: string = '';
    aiName: string = 'CommerceAI';
    domain: string = 'http://localhost:8000';
    chatMessages: ChatMessage[] = [];
    currentSessionId: string | null = null;
    userId: string = 'entangle'; // Replace with dynamic user ID if needed
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
            }
        });
    }

    getToken() {
        const loginData = {
            email: 'alice.smith123@example.com',
            password: 'newsecurepass123',
        };
        this.http
            .post<LoginResponse>('https://micro-scale.software/api/login', loginData)
            .subscribe({
                next: (response) => {
                    sessionStorage.setItem('jwt', response.JWT_Token);
                },
                error: (err) => {
                    console.error('Login error:', err);
                    this.snackBar.open('Failed to authenticate. Please try again.', 'Close', { duration: 3000 });
                },
            });
    }

    async ngOnInit(): Promise<void> {
        if (!sessionStorage.getItem('jwt')) {
            this.getToken();
        }

        // Fetch AI model name
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
        this.currentSessionId = sessionId;
        try {
            const headers = new HttpHeaders({
                user_id: this.userId,
                authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
            });
            const response = await this.http
                .get<SessionResponse>(`${this.domain}/session/${sessionId}`, { headers })
                .toPromise();
            this.chatMessages = (response?.response || []).map((msg) => ({
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
        this.chatMessages = [];
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

    async onSend() {
        const trimmed = this.message.trim();
        if (!trimmed) return;

        if (!this.currentSessionId) {
            try {
                const headers = new HttpHeaders({
                    user_id: this.userId,
                    authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
                });
                const newSession = await this.http
                    .post<ChatSession>(`${this.domain}/sessions/create`, {}, { headers })
                    .toPromise();

                if (newSession && newSession.id) {
                    this.currentSessionId = newSession.id;
                    this.selectedSessionService.setSessionId(newSession.id);
                } else {
                    throw new Error('Invalid session response from server');
                }
            } catch (err) {
                console.error('Failed to create new session:', err);
                this.snackBar.open('Failed to create new session.', 'Close', { duration: 3000 });
                return;
            }
        }

        const userMessage: ChatMessage = {
            role: 'user',
            messages: [`user query: ${trimmed}; AuthToken: ${sessionStorage.getItem('jwt') || ''}`],
            sessionId: this.currentSessionId,
        };
        this.chatMessages.push(userMessage);
        this.cdr.detectChanges();

        // Save user message to backend
        try {
            await this.http
                .post(`${this.domain}/session/${this.currentSessionId}/messages`, userMessage, {
                    headers: new HttpHeaders({
                        user_id: this.userId,
                        authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
                    }),
                })
                .toPromise();
        } catch (err) {
            console.error('Error saving user message:', err);
            this.snackBar.open('Failed to save user message.', 'Close', { duration: 3000 });
        }

        if (trimmed.includes('add product form')) {
            const formMessage: ChatMessage = {
                role: 'form',
                messages: [`user query: ${trimmed}; AuthToken: ${sessionStorage.getItem('jwt') || ''}`],
                sessionId: this.currentSessionId,
            };
            this.chatMessages.push(formMessage);
            this.cdr.detectChanges();
        }

        this.message = '';

        const body = {
            model: this.aiName,
            messages: [{ role: 'user', content: trimmed }],
            stream: true,
        };

        try {
            const response = await fetch(`${this.domain}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    user_id: this.userId,
                    authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
                },
                body: JSON.stringify(body),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let modelContent = '';
            const modelMessage: ChatMessage = {
                role: 'model',
                messages: [],
                sessionId: this.currentSessionId!,
            };

            while (true) {
                const { done, value } = await reader!.read();
                if (done) {
                    if (modelContent) {
                        modelMessage.messages = [modelContent];
                        this.chatMessages.push(modelMessage);
                        // Save model message to backend
                        await this.http
                            .post(`${this.domain}/session/${this.currentSessionId}/messages`, modelMessage, {
                                headers: new HttpHeaders({
                                    user_id: this.userId,
                                    authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
                                }),
                            })
                            .toPromise();
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
                            modelMessage.messages = [modelContent];
                            this.chatMessages.push(modelMessage);
                            await this.http
                                .post(`${this.domain}/session/${this.currentSessionId}/messages`, modelMessage, {
                                    headers: new HttpHeaders({
                                        user_id: this.userId,
                                        authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
                                    }),
                                })
                                .toPromise();
                        }
                        this.cdr.detectChanges();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        const delta = json?.choices?.[0]?.delta;

                        if (delta?.content) {
                            modelContent += delta.content;
                            modelMessage.messages = [modelContent];
                            this.cdr.detectChanges();
                        }
                    } catch (e) {
                        console.error('Error parsing stream chunk', e);
                    }
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);
            this.snackBar.open('Failed to send message.', 'Close', { duration: 3000 });
        }
    }

    ngOnDestroy() {
        this.sessionSubscription.unsubscribe();
    }
}
