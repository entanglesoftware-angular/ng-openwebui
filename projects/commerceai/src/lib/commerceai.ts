import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

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
  private scrollThrottleTimer: any = null;
  isStreaming = false;

  excel_mime_types = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/vnd.ms-excel.sheet.macroEnabled.12"]

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private routeSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.routeSubscription = this.route.params.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.currentSessionId = sessionId;
        this.loadSessionMessages(sessionId);
      } else {
        this.currentSessionId = null;
        this.chatMessages.events = [];
          this.cdr.detectChanges();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    console.log('Initializing...');
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
      this.router.navigate(['..'], { relativeTo: this.route }); // Navigate to new chat
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottomAfterViewChecked();
  }

  scrollToBottomAfterViewChecked() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
  scrollToBottom() {
  if (!this.scrollThrottleTimer) {
    this.scrollThrottleTimer = setTimeout(() => {
      try {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      } catch {}
      this.scrollThrottleTimer = null;
    }, 100); // Throttle every 100ms
  }
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
    const result =  XLSX.utils.sheet_to_csv(firstSheet);
    console.log("excel to csv")
    return result;
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
        if (newSession && newSession.id) {
          sessionId = newSession.id;
          this.currentSessionId = sessionId;
          isNewSession = true;
          // this.router.navigate([sessionId], { relativeTo: this.route.parent });
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
        this.cdr.detectChanges();

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
          let mimeType:string = file.type || 'application/octet-stream';
          let content:string = ""
          if(mimeType == "text/csv"){
            content = await file.text();
          }
          else if(mimeType.startsWith("image/")){
            content = await this.convertFileToBase64(file);
          }
          else if(mimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType == "application/vnd.ms-excel" || mimeType == "application/vnd.ms-excel.sheet.macroEnabled.12"){
            console.log("Excel file detected")
            content = await this.convertExcelToCsv(file);
            mimeType = "text/csv"
          } else {
            content = await this.convertFileToBase64(file);
            console.log("File detected")
            console.log(mimeType)
          }
          console.log(`Mime type : ${mimeType}, ${file.type}`)
          const userFile: ChatReqMessage = {
            role: 'user',
            type: mimeType,
            content:content,
          };
          ReqBody.messages.push(userFile);

          const fileEventMessage: EventMessage = {
            type: mimeType,
            content,
          };
          console.log(fileEventMessage.type)
          this.chatMessages.events[this.chatMessages.events.length - 1].messages.push(fileEventMessage);
            this.cdr.detectChanges();
        } catch (error) {
          console.error(`Failed to convert file ${file.name}:`, error);
          this.snackBar.open(`Failed to attach file: ${file.name}`, 'Close', { duration: 3000 });
        }
      }
    }
    this.clearAllFiles();

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
      if (response.status !== 200) {
        this.snackBar.open(`Error : ${response.status} ${response}`, 'Close',{ duration: 3000 })
        return
      }
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
      this.isStreaming = false;
      let n = this.chatMessages.events.length - 1
      let m = this.chatMessages.events[n].messages.length - 1

      while (true) {
        const { done, value } = await reader!.read();
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') {
            this.router.navigate([sessionId], { relativeTo: this.route.parent });
            this.cdr.detectChanges();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta;
            if(delta?.role === "text/csv"){
              const raw = delta?.content
              const onceParsed = JSON.parse(raw);
              const result = JSON.parse(onceParsed);
               const fileEventMessage: EventMessage = {
                  type: delta.role,
                  content: result.csv,
                };
                console.log(fileEventMessage.type)
                this.chatMessages.events[this.chatMessages.events.length - 1].messages.push(fileEventMessage);
                this.cdr.detectChanges();
            }
            if (delta?.content && delta?.role == "model") {
              this.chatMessages.events[n].messages[m].content += delta.content;
              this.scrollToBottom()
              this.cdr.detectChanges();
            }
          } catch (err) {
            this.snackBar.open(`Error parsing stream chunk: ${err}`, 'CLose', { duration: 3000 })
            console.error('Error parsing stream chunk:', err);
            return
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      this.snackBar.open('Failed to send message.', 'Close', { duration: 3000 });
      return
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

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }





  downloadCsv(csvString:string): void {

    if (!csvString) {
      console.error('CSV string is empty');
      return;
    }

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csvfile.csv`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  downloadExcel(csvString:string): void {
    if (!csvString) {
      console.error('CSV string is empty');
      return;
    }

    try {
      // Parse CSV string manually into an array of arrays (AoA)
      const rows = csvString.split('\n').filter(row => row.trim() !== '');
      const aoa: string[][] = rows.map(row => row.split(',').map(cell => cell.trim()));

      // Create a workbook and worksheet using aoa_to_sheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate XLSX file and trigger download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `excelFile.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  }
}
