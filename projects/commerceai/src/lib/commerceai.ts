import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy, Input, Optional, Inject } from '@angular/core';
import { MaterialModule } from './modules/material.module';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { CommerceAIConfig } from './config/commerceai-config';
import { COMMERCE_AI_CONFIG } from './config/commerceai-config.token';
import { CommerceAIConfigValidator } from './services/commerceai-config-validator.service';
import * as XLSX from 'xlsx';
import { A11yModule } from '@angular/cdk/a11y';
import { gsap } from 'gsap';

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
    MatTooltipModule,
    A11yModule
  ],
  providers: [],
  templateUrl: './commerceai.html',
  styleUrl: './commerceai.css',
})
export class Commerceai implements OnInit, AfterViewChecked, OnDestroy {
  message: string = '';
  aiName: string = 'CommerceAI';
  chatMessages: Events = { events: [] };
  currentSessionId: string | null = null;
  selectedFiles: File[] = [];
  private scrollThrottleTimer: any = null;
  isStreaming = false;
  formData = '';
  isListening: boolean = false;
  speechRecognition: any;

  excel_mime_types = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/vnd.ms-excel.sheet.macroEnabled.12"]

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private routeSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private configValidator: CommerceAIConfigValidator,
    @Inject(COMMERCE_AI_CONFIG) private config: CommerceAIConfig
  ) {
    this.routeSubscription = this.route.params.subscribe(params => {
      const userId = params['user_id'];
      if (userId) {
        this.config.userId = userId
      }
      const sessionId = params['session_id'];
      if (sessionId) {
        this.currentSessionId = sessionId;
        this.loadSessionMessages(sessionId);
      } else {
        this.currentSessionId = null;
        this.chatMessages.events = [];
        requestAnimationFrame(() => {
          this.cdr.detectChanges();
        });
      }
    });
    this.config = this.configValidator.getConfig();
  }

  async ngOnInit(): Promise<void> {
    console.log('Initializing...');
    this.http
      .get<any>(`${this.config.domain}/v1/models`, {
        headers: this.buildHeaders()
      })
      .subscribe({
        next: (res) => {
          this.aiName = res?.data?.[0]?.id ?? 'Unknown AI';
        },
        error: () => {
          this.aiName = 'Select Model';
          this.snackBar.open('Failed to fetch model name.', 'Close', { duration: 3000 });
        },
      });
  }

  async loadSessionMessages(sessionId: string) {
    this.chatMessages.events = [];
    try {
      const headers = this.buildHeaders();
      const response = await this.http
        .get<Events>(`${this.config.domain}/session/${sessionId}`, { headers })
        .toPromise();
      this.chatMessages.events = (response?.events || []).map((msg) => ({
        ...msg,
        sessionId,
      }));
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
      });
    } catch (err) {
      console.error('Error loading messages for session:', err);
      this.snackBar.open('Failed to load messages.', 'Close', { duration: 3000 });
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  ngAfterViewChecked(): void {
    // Removed automatic scroll to bottom here to handle it with GSAP
  }

  animateNewMessage(element: HTMLElement) {
    gsap.fromTo(
      element,
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => this.scrollToBottomWithAnimation(),
      }
    );
  }

  scrollToBottomWithAnimation() {
    if (!this.scrollThrottleTimer) {
      this.scrollThrottleTimer = setTimeout(() => {
        try {
          const container = this.chatContainer.nativeElement;
          gsap.to(container, {
            scrollTop: container.scrollHeight,
            duration: 0.5,
            ease: 'power2.out',
          });
        } catch { }
        this.scrollThrottleTimer = null;
      }, 100);
    }
  }

  checkForFormTrigger(content: string) {
    let formData = JSON.parse(content);
    this.openDynamicForm(formData);
  }

  openDynamicForm(formData: any): void {
    const dialogRef = this.dialog.open(DynamicFormDialogComponent, {
      width: '600px',
      data: formData,
    });
    dialogRef.afterClosed().subscribe(formData => {
      if (formData?.closedByUser) {
        this.clearAllForm();
      } else if (formData) {
        this.formData = JSON.stringify(formData);
        this.onSend();
        this.clearAllForm();
      }
    });
  }

  openCsvDialog(csvString: string): void {
    this.dialog.open(CsvPreviewDialogComponent, {
      width: '70vw',
      maxHeight: '80vh',
      panelClass: 'csv-dialog-panel',
      data: {
        csv: csvString,
      },
    });
  }

  private async convertExcelToCsv(file: File): Promise<string> {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const result = XLSX.utils.sheet_to_csv(firstSheet);
    return result;
  }

  async onSend() {
    const trimmed = this.message.trim();
    if (!trimmed && this.selectedFiles.length === 0 && !this.formData) return;

    let sessionId = this.currentSessionId;
    let isNewSession = false;
    if (!sessionId) {
      try {
        const headers = this.buildHeaders();
        const newSession = await this.http
          .post<ChatSession>(`${this.config.domain}/session/create`, {}, { headers })
          .toPromise();
        if (newSession && newSession.id) {
          sessionId = newSession.id;
          this.currentSessionId = sessionId;
          isNewSession = true;
        } else {
          throw new Error('Invalid session response from server');
        }
      } catch (err) {
        console.error('Failed to create new session:', err);
        this.snackBar.open('Failed to create new session.', 'Close', { duration: 3000 });
        return;
      }
    }

    if (trimmed) {
      const eventMessage: EventMessage = {
        type: 'text',
        content: trimmed,
      };
      const userMessage: event = {
        role: 'user',
        messages: [eventMessage],
      };
      this.chatMessages.events.push(userMessage);
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
        const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
        if (lastMessage) {
          this.animateNewMessage(lastMessage);
        }
      });
    }

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
    this.isStreaming = true;

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (const file of this.selectedFiles) {
        try {
          let mimeType: string = file.type || 'application/octet-stream';
          let content: string = "";
          if (mimeType == "text/csv") {
            content = await file.text();
          } else if (mimeType.startsWith("image/")) {
            content = await this.convertFileToBase64(file);
          } else if (this.excel_mime_types.includes(mimeType)) {
            content = await this.convertExcelToCsv(file);
            mimeType = "text/csv";
          } else {
            content = await this.convertFileToBase64(file);
          }
          const userFile: ChatReqMessage = {
            role: 'user',
            type: mimeType,
            content: content,
          };
          ReqBody.messages.push(userFile);

          const fileEventMessage: EventMessage = {
            type: mimeType,
            content,
          };
          this.chatMessages.events[this.chatMessages.events.length - 1].messages.push(fileEventMessage);
          requestAnimationFrame(() => {
            this.cdr.detectChanges();
            const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
            if (lastMessage) {
              this.animateNewMessage(lastMessage);
            }
          });
        } catch (error) {
          console.error(`Failed to convert file ${file.name}:`, error);
          this.snackBar.open(`Failed to attach file: ${file.name}`, 'Close', { duration: 3000 });
        }
      }
    }

    if (this.formData) {
      const userMessage: ChatReqMessage = {
        role: 'user',
        type: 'application/json',
        content: this.formData,
      };
      ReqBody.messages.push(userMessage);
    }
    this.clearAllFiles();
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const headersObj = {
        'Content-Type': 'application/json',
        user_id: this.config.userId,
        session_id: sessionId,
      };

      const finalHeaders = this.buildHeaders(headersObj);
      const headersPlainObject: { [key: string]: string } = {};
      finalHeaders.keys().forEach((key) => {
        headersPlainObject[key] = finalHeaders.get(key) as string;
      });
      const response = await fetch(`${this.config.domain}/v1/chat/completions`, {
        method: 'POST',
        headers: headersPlainObject,
        body: JSON.stringify(ReqBody),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let modelContent = '';
      const eventMessage: EventMessage = {
        type: 'text',
        content: modelContent,
      };
      const modelMessage: event = {
        role: 'model',
        messages: [eventMessage],
      };
      this.chatMessages.events.push(modelMessage);
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
        const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
        if (lastMessage) {
          this.animateNewMessage(lastMessage);
        }
      });
      this.isStreaming = false;

      let lastGeneralIndex = this.chatMessages.events.length - 1;
      let lastFormEvent: event | null = null;
      const TIMEOUT_MS = 25000; // 25 seconds timeout for no data
      let timeoutHandle: any;
      let hasContent = false;
      const resetTimeout = () => {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
          controller.abort();
          this.snackBar.open('Something Went Wrong. Please try again.', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        }, TIMEOUT_MS);
      };
      try {
        resetTimeout();
        while (true) {
          const { done, value } = await reader!.read();
          if (done) {
            break;
          }

          resetTimeout();
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split('\n')
            .filter((line) => line.trim() !== '' && line.startsWith('data: '));

          for (const line of lines) {
            const data = line.replace('data: ', '').trim();
            if (data === '[DONE]') {
              clearTimeout(timeoutHandle);
              controller.abort();
              this.router.navigate([this.config.userId, sessionId], { relativeTo: this.route.parent });
              requestAnimationFrame(() => {
                this.cdr.detectChanges();
              });
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta;
              const content = delta?.content;
              const role = delta?.role;
              resetTimeout();

              if (!content) continue;
              hasContent = true;

              if (role === 'form' && this.isValidJson(content)) {
                if (!lastFormEvent) {
                  lastFormEvent = {
                    role: 'form',
                    messages: [
                      {
                        type: 'text',
                        content: '',
                      },
                    ],
                  };
                  this.chatMessages.events.push(lastFormEvent);
                  requestAnimationFrame(() => {
                    this.cdr.detectChanges();
                    const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
                    if (lastMessage) {
                      this.animateNewMessage(lastMessage);
                    }
                  });
                }
                lastFormEvent.messages[0].content += content;
              } else if (role === "text/csv") {
                const raw = delta?.content;
                const onceParsed = JSON.parse(raw);
                const result = JSON.parse(onceParsed);
                const fileEventMessage: EventMessage = {
                  type: delta.role,
                  content: result.csv,
                };
                this.chatMessages.events[lastGeneralIndex].messages.push(fileEventMessage);
                requestAnimationFrame(() => {
                  this.cdr.detectChanges();
                  const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
                  if (lastMessage) {
                    this.animateNewMessage(lastMessage);
                  }
                });
              } else {
                const generalEvent = this.chatMessages.events[lastGeneralIndex];
                generalEvent.messages[0].content += content;
              }
              this.scrollToBottomWithAnimation();
              requestAnimationFrame(() => {
                this.cdr.detectChanges();
              });
            } catch (err) {
              this.snackBar.open(`Error parsing stream chunk: ${err}`, 'Close', { duration: 3000 });
              console.error('Error parsing stream chunk:', err);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Stream aborted or failed:', error);
        this.snackBar.open('Something Went Wrong. Please try again.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
        return;
      } finally {
        clearTimeout(timeoutHandle);
        if (!hasContent) {
          this.chatMessages.events.pop();
        }
        return;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      this.snackBar.open('Failed to send message.', 'Close', { duration: 3000 });
      return;
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

  isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.snackBar.open(`${this.selectedFiles.length} file(s) selected`, 'Close', {
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

  clearAllForm(): void {
    this.chatMessages.events = this.chatMessages.events.filter(e => e.role !== 'form');
    this.formData = '';
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  getShortenedFileName(fileName: string): string {
    const maxChars = 10;
    const dotIndex = fileName.lastIndexOf('.');
    const namePart = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
    const extension = dotIndex !== -1 ? fileName.substring(dotIndex) : '';
    const trimmedName = namePart.length > maxChars ? namePart.substring(0, maxChars) + '...' : namePart;

    return `${trimmedName}${extension}`;
  }

  downloadCsv(csvString: string): void {
    if (!csvString) {
      console.error('CSV string is empty');
      return;
    }

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csvfile.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  downloadExcel(csvString: string): void {
    if (!csvString) {
      console.error('CSV string is empty');
      return;
    }

    try {
      const rows = csvString.split('\n').filter(row => row.trim() !== '');
      const aoa: string[][] = rows.map(row => row.split(',').map(cell => cell.trim()));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `excelFile.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  }

  private buildHeaders(additionalHeaders: { [key: string]: string } = {}): HttpHeaders {
    const headers: { [key: string]: string } = {
      user_id: this.config.userId,
      authorization: `Bearer ${sessionStorage.getItem('jwt') || ''}`,
      ...additionalHeaders
    };
    return new HttpHeaders(headers);
  }

  startVoiceInput(): void {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    if (this.isListening && this.speechRecognition) {
      this.isListening = false;
      this.speechRecognition.stop();
      return;
    }

    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.lang = 'en-US';
    this.speechRecognition.interimResults = false;
    this.speechRecognition.maxAlternatives = 1;

    this.speechRecognition.onstart = () => {
      this.isListening = true;
    };

    this.speechRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.message = this.message + ' ' + transcript;
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
    };

    this.speechRecognition.onerror = (event: any) => {
      this.isListening = false;
    };

    this.speechRecognition.start();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied!', 'Close', { duration: 3000 });
    }).catch(err => {
      this.snackBar.open('Failed to copy message.', 'Close', { duration: 3000 });
    });
  }

  speak(text: string): void {
    if (!text) return;

    const synth = window.speechSynthesis;

    // Stop current speaking if already in progress
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // or set dynamically

    synth.speak(utterance);
  }
}
