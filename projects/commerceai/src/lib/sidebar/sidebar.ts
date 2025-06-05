import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';
import { MaterialModule } from '../modules/material.module';
import {ChatPersistenceService } from '../services/chat-persistence.service'
import { ChatSession } from '../models/chat-session.model';

@Component({
  selector: 'lib-sidebar',
  imports: [
    MaterialModule,
    FormsModule,
    HttpClientModule,
    NgClass,
    NgForOf,
    MarkdownModule,
    NgIf,
    CommonModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  @Output() sessionSelected = new EventEmitter<number>();
  constructor(
    private chatPersistence: ChatPersistenceService,
    private cdr: ChangeDetectorRef
  ) { }

  chatNames: ChatSession[] = [];
  async addNewChat() {
    const newSession = await this.chatPersistence.saveSession();
    this.chatNames = [newSession, ...this.chatNames];
    this.sessionSelected.emit(newSession.sessionId);
    this.cdr.detectChanges();
  }
  async ngOnInit() {
  try {
    const loadedSessions = await this.chatPersistence.loadSessions();
    this.chatNames = Array.isArray(loadedSessions) ? loadedSessions : [];

    if (this.chatNames.length > 0 && this.chatNames[0]?.sessionId) {
      const sessionId = this.chatNames[0].sessionId;
      this.sessionSelected.emit(sessionId);

      // const loadedMessages = await this.chatPersistence.loadMessages(sessionId);
      // this.chatMessages = Array.isArray(loadedMessages) ? loadedMessages : [];
    } else {
      // console.warn('No valid chat sessions found.');
      // this.chatMessages = [];
    }
  } catch (err) {
    // console.error('Failed to load chat history:', err);
    // this.chatMessages = [];
  }
}

  onSelectSession(session: ChatSession) {
    this.sessionSelected.emit(session.sessionId);
  }
}
