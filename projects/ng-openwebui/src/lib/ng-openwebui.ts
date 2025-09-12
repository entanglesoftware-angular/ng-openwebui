import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, ChangeDetectorRef, OnDestroy, Input, Optional, Inject, PLATFORM_ID, ErrorHandler } from '@angular/core';
import { MaterialModule } from './modules/material.module';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { NgClass, NgForOf, NgIf, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sidebar } from './sidebar/sidebar';
// import { ChatPersistenceService } from './services/chat-persistence.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Header } from "./header/header";
import {
  ChatReq,
  ChatReqMessage,
  Events,
  event,
  EventMessage,
} from './models/chat-message.model';
import { ChatSession } from './models/chat-session.model';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormDialogComponent } from './form/dynamic-form-dialog.component';
import { CsvPreviewDialogComponent } from './csv-preview-dialog/csv-preview-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { NgOpenwebUIConfig } from './config/ng-openwebui-config';
import { NG_OPEN_WEB_UI_CONFIG } from './config/ng-openwebui-config.token';
import { NgOpenwebUIConfigValidator } from './services/ng-openwebui-config-validator.service';
import * as XLSX from 'xlsx';
import { A11yModule } from '@angular/cdk/a11y';
import gsap from 'gsap';
import { NgOpenwebUIThemeService } from './theme/theme.service';
import { GlobalErrorHandler } from './global-error-handler.service';


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
  selector: 'lib-ng-openwebui',
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
    A11yModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    HttpClientModule,
    MatTooltip,
    Header
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }, 
    MarkdownService,
  ],
  templateUrl: './ng-openwebui.html',
  styleUrl: './ng-openwebui.css',
})
export class NgOpenwebUI implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  message: string = '';
  aiName: string = 'NgOpenwebUI';
  // chatMessages: ChatMessage[] = [];
  modelMap: { model: string; domain: string }[] = [];
  selectedModel: string = '';
  selectedDomain: string = '';
  dropdownOpen: boolean = false;
  domain: string = '';
  selectedIndex: number = 0;
  chatMessages: Events = { events: [] };
  currentSessionId: string | null = null;
  selectedFiles: File[] = [];
  private scrollThrottleTimer: any = null;
  isStreaming = false;
  formData = '';
  isListening: boolean = false;
  speechRecognition: any;
  public isBrowser: boolean;
  private lastEventCount = 0;

  excel_mime_types = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ];

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private routeSubscription!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private configValidator: NgOpenwebUIConfigValidator,
    private themeService: NgOpenwebUIThemeService,
    @Inject(NG_OPEN_WEB_UI_CONFIG) private config: NgOpenwebUIConfig,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.themeService.loadSavedTheme();
    this.config = this.configValidator.getConfig();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private loadModels() {
    console.log('Initializing...');
    this.http.get<any>(`${this.config.domain}/v1/models`, { headers: this.buildHeaders() })
      .subscribe({
        next: (res) => this.aiName = res?.data?.[0]?.id ?? 'Select Model',
        error: () => this.aiName = 'Select Model'
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadModels();
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      this.routeSubscription = this.route.params.subscribe((params) => {
        const sessionId = params['session_id'];
        if (sessionId) {
          this.currentSessionId = sessionId;
          this.loadSessionMessages(sessionId);
        } else {
          this.currentSessionId = null;
          this.chatMessages.events = [];
          this.cdr.markForCheck();
        }
      });
    }
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
      if (this.isBrowser) {
        this.cdr.markForCheck();
      }
    } catch (err) {
      console.error('Error loading messages for session:', err);
      this.snackBar.open('Failed to load messages.', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
  ngAfterViewChecked(): void {
    if (this.chatMessages.events.length !== this.lastEventCount) {
      this.lastEventCount = this.chatMessages.events.length;
      this.updateUIAndAnimate();
    }
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

  scrollToBottomAfterViewChecked() {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  scrollToBottom() {
    if (!this.scrollThrottleTimer) {
      this.scrollThrottleTimer = setTimeout(() => {
        try {
          this.chatContainer.nativeElement.scrollTop =
            this.chatContainer.nativeElement.scrollHeight;
        } catch { }
        this.scrollThrottleTimer = null;
      }, 100); // Throttle every 100ms
    }
  }

  clearChat(): void {
    this.chatMessages.events = [];
    if (this.currentSessionId) {
      const headers = new HttpHeaders({
        user_id: this.config.userId,
        authorization: this.isBrowser ? `Bearer ${sessionStorage.getItem('jwt') || ''}` : '',
      });
      this.http
        .delete(`${this.domain}/session/${this.currentSessionId}/messages`, {
          headers,
        })
        .toPromise()
        .catch((err) => {
          console.error('Error clearing messages:', err);
          this.snackBar.open('Failed to clear messages.', 'Close', {
            duration: 3000, panelClass: ['lib-snackbar']
          });
        });
    }
    this.cdr.markForCheck();
  }

  checkForFormTrigger(content: string | undefined) {
    if (!isPlatformBrowser(this.platformId) || !content) {
      return; // Prevent server-side execution
    }
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

  openCsvDialog(csvString: string | undefined): void {
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
    if (!this.isValidInput(trimmed)) return;

    let sessionId = await this.ensureSession();
    if (!sessionId) return;

    this.handleUserTextMessage(trimmed);

    const reqBody = await this.buildRequestBody(trimmed);
    this.isStreaming = true;

    await this.handleFileUploads(reqBody);

    this.appendFormData(reqBody);

    try {
      await this.streamResponse(sessionId, reqBody);
    } catch (err) {
      this.handleError('Failed to send message.', err);
    }
  }

  private isValidInput(trimmed: string): boolean {
    if (!trimmed && this.selectedFiles.length === 0 && !this.formData) {
      return false;
    }
    return true;
  }

  private async ensureSession(): Promise<string | null> {
    if (this.currentSessionId) return this.currentSessionId;

    try {
      const headers = this.buildHeaders();
      const newSession = await this.http
        .post<ChatSession>(`${this.config.domain}/session/create`, {}, { headers })
        .toPromise();

      if (newSession && newSession.id) {
        this.currentSessionId = newSession.id;
        return newSession.id;
      } else {
        throw new Error('Invalid session response from server');
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
      this.snackBar.open('Failed to create new session.', 'Close', {
        duration: 3000, panelClass: ['lib-snackbar']
      });
      return null;
    }
  }

  private handleUserTextMessage(trimmed: string) {
    if (!trimmed) return;

    const eventMessage: EventMessage = { type: 'text', content: trimmed };
    const userMessage: event = { role: 'user', messages: [eventMessage] };

    this.chatMessages.events.push(userMessage);
    this.updateUIAndAnimate();
    this.message = '';
  }

  private async buildRequestBody(trimmed: string): Promise<ChatReq> {
    const reqBody: ChatReq = {
      model: this.aiName,
      messages: [],
      stream: true,
    };

    if (trimmed) {
      reqBody.messages.push({ role: 'user', type: 'text', content: trimmed });
    }

    return reqBody;
  }

  private async handleFileUploads(reqBody: ChatReq) {
    if (!this.selectedFiles || this.selectedFiles.length === 0) return;

    for (const file of this.selectedFiles) {
      try {
        let { mimeType, content } = await this.processFile(file);

        const userFile: ChatReqMessage = { role: 'user', type: mimeType, content };
        reqBody.messages.push(userFile);

        const fileEventMessage: EventMessage = { type: mimeType, content };
        this.chatMessages.events[this.chatMessages.events.length - 1].messages.push(fileEventMessage);

        this.updateUIAndAnimate();
        this.clearAllFiles();
      } catch (error) {
        console.error(`Failed to convert file ${file.name}:`, error);
        this.snackBar.open(`Failed to attach file: ${file.name}`, 'Close', {
          duration: 3000, panelClass: ['lib-snackbar']
        });
      }
    }
  }

  private async processFile(file: File): Promise<{ mimeType: string; content: string }> {
    let mimeType: string = file.type || 'application/octet-stream';
    let content: string = "";

    if (mimeType === "text/csv") {
      content = await file.text();
    } else if (mimeType.startsWith("image/")) {
      content = await this.convertFileToBase64(file);
    } else if (this.excel_mime_types.includes(mimeType)) {
      content = await this.convertExcelToCsv(file);
      mimeType = "text/csv";
    } else {
      content = await this.convertFileToBase64(file);
    }

    return { mimeType, content };
  }

  private appendFormData(reqBody: ChatReq) {
    if (!this.formData) return;

    const userMessage: ChatReqMessage = {
      role: 'user',
      type: 'application/json',
      content: this.formData,
    };
    reqBody.messages.push(userMessage);
  }

  private async streamResponse(sessionId: string, reqBody: ChatReq) {
    const controller = new AbortController();

    const headersObj = {
      'Content-Type': 'application/json',
      user_id: this.config.userId,
      session_id: sessionId,
    };

    const finalHeaders = this.buildHeaders(headersObj);

    const headersPlainObject = finalHeaders.keys().reduce((acc: Record<string, string>, key: string) => {
      const value = finalHeaders.get(key);
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const response = await fetch(`${this.config.domain}/v1/chat/completions`, {
      method: 'POST',
      headers: headersPlainObject,
      body: JSON.stringify(reqBody),
    });

    if (response.status !== 200) {
      this.snackBar.open(`Error : ${response.status} ${response}`, 'Close', {
        duration: 3000, panelClass: ['lib-snackbar']
      });
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    this.prepareModelMessage();

    await this.readStream(reader!, decoder, controller, sessionId);
  }

  private prepareModelMessage() {
    const eventMessage: EventMessage = { type: 'text', content: '' };
    const modelMessage: event = { role: 'model', messages: [eventMessage] };

    this.chatMessages.events.push(modelMessage);
    this.updateUIAndAnimate();
  }

  private async readStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder, controller: AbortController, sessionId: string) {
    let lastGeneralIndex = this.chatMessages.events.length - 1;
    let lastFormEvent: event | null = null;
    const TIMEOUT_MS = 25000;
    let timeoutHandle: any;
    let hasContent = false;

    const resetTimeout = () => {
      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(() => {
        controller.abort();
        this.snackBar.open('Something Went Wrong. Please try again.', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
        this.cdr.markForCheck();
      }, TIMEOUT_MS);
    };

    resetTimeout();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetTimeout();
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') {
            clearTimeout(timeoutHandle);
            controller.abort();
            this.router.navigate([this.config.userId, sessionId], { relativeTo: this.route.parent });
            this.cdr.markForCheck();
            return;
          }

          this.processStreamChunk(data, lastGeneralIndex, lastFormEvent);
          hasContent = true;
        }
      }
    } catch (error) {
      console.error('Stream aborted or failed:', error);
      this.snackBar.open('Something Went Wrong. Please try again.', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
      this.cdr.markForCheck();
    } finally {
      clearTimeout(timeoutHandle);
      this.isStreaming = false;
      if (!hasContent) {
        this.chatMessages.events.pop();
      }
    }
  }

  private processStreamChunk(data: string, lastGeneralIndex: number, lastFormEvent: event | null) {
    try {
      const json = JSON.parse(data);
      const delta = json?.choices?.[0]?.delta;
      const content = delta?.content;
      const role = delta?.role;

      if (!content){
        return;
      } 

      if (role === 'form' && this.isValidJson(content)) {
        if (!lastFormEvent) {
          lastFormEvent = { role: 'form', messages: [{ type: 'text', content: '' }] };
          this.chatMessages.events.push(lastFormEvent);
          this.updateUIAndAnimate();
        }
        lastFormEvent.messages[0].content += content;
      } else if (role === "text/csv") {
        const raw = delta?.content;
        const onceParsed = JSON.parse(raw);
        const result = JSON.parse(onceParsed);

        const fileEventMessage: EventMessage = { type: delta.role, content: result.csv };
        this.chatMessages.events[lastGeneralIndex].messages.push(fileEventMessage);
        this.updateUIAndAnimate();
      } else {
        const generalEvent = this.chatMessages.events[lastGeneralIndex];
        generalEvent.messages[0].content += content;
      }

      this.scrollToBottomWithAnimation();
      this.cdr.markForCheck();
    } catch (err) {
      this.snackBar.open(`Error parsing stream chunk: ${err}`, 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
      console.error('Error parsing stream chunk:', err);
    }
  }

  private updateUIAndAnimate() {
    requestAnimationFrame(() => {
      this.cdr.markForCheck();
      const lastMessage = this.chatContainer.nativeElement.querySelector('.message:last-child');
      if (lastMessage) {
        this.animateNewMessage(lastMessage);
      }
    });
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.snackBar.open(message, 'Close', {
      duration: 3000, panelClass: ['lib-snackbar']
    });
  }

  hasValidMessages(messages: any[] | undefined): boolean {
    if (!messages || messages.length === 0) {
      return false;
    }

    const hasValidMessage = messages.some(
      msg => msg?.type === 'text' && msg?.content?.trim()
    );

    return hasValidMessage;
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
      this.snackBar.open(
        `${this.selectedFiles.length} file(s) selected`,
        'Close',
        {
          duration: 2000, panelClass: ['lib-snackbar']
        }
      );
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
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getShortenedFileName(fileName: string | undefined): string {
    if (!fileName) return '';
    const maxChars = 10;
    const dotIndex = fileName.lastIndexOf('.');
    const namePart = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
    const extension = dotIndex !== -1 ? fileName.substring(dotIndex) : '';
    const trimmedName = namePart.length > maxChars ? namePart.substring(0, maxChars) + '...' : namePart;

    return `${trimmedName}${extension}`;
  }

  downloadCsv(csvString: string | undefined): void {
    if (!csvString || !this.isBrowser) return;

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    if (this.isBrowser) {
      const url = window.URL.createObjectURL(blob);
      const link = this.document.createElement('a');
      link.href = url;
      link.download = `csvfile.csv`;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
  }

  downloadExcel(csvString: string | undefined): void {
    if (!csvString || !this.isBrowser) return;

    try {
      const rows = csvString.split('\n').filter(row => row.trim() !== '');
      const aoa: string[][] = rows.map(row => row.split(',').map(cell => cell.trim()));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      if (this.isBrowser) {
        const url = window.URL.createObjectURL(blob);
        const link = this.document.createElement('a');
        link.href = url;
        link.download = `excelFile.xlsx`;
        this.document.body.appendChild(link);
        link.click();
        this.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  }

  private buildHeaders(additionalHeaders: { [key: string]: string } = {}): HttpHeaders {
    const headers: { [key: string]: string } = {
      user_id: this.config.userId,
      authorization: this.isBrowser ? `Bearer ${sessionStorage.getItem('jwt') || ''}` : '',
      ...additionalHeaders
    };
    return new HttpHeaders(headers);
  }

  startVoiceInput(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Prevent execution on server
    }
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
      this.message = `${this.message} ${transcript}`;
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
    };

    this.speechRecognition.onerror = (event: any) => {
      this.isListening = false;
    };

    this.speechRecognition.start();
  }

  copyToClipboard(text: string | undefined): void {
    if (!isPlatformBrowser(this.platformId) || !text) {
      return; // Prevent server-side execution
    }

    if (!this.isBrowser || !navigator?.clipboard) {
      this.snackBar.open('Clipboard API not supported.', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied!', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
    }).catch(err => {
      this.snackBar.open('Failed to copy message.', 'Close', { duration: 3000, panelClass: ['lib-snackbar'] });
    });
  }

  speak(text: string | undefined): void {
    if (!isPlatformBrowser(this.platformId) || !text) {
      return; // Prevent execution on server
    }

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
