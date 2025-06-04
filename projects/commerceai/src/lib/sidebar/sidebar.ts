import { Component, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private chatPersistence: ChatPersistenceService,
    private cdr: ChangeDetectorRef
  ) { }

  chatNames: ChatSession[] = [];
  async addNewChat() {
    const newSession = await this.chatPersistence.saveSession();
    this.chatNames = [newSession, ...this.chatNames];
    this.cdr.detectChanges();
  }
  async ngOnInit(): Promise<void> {
    try {
      const loadedSessions = await this.chatPersistence.loadSessions();
      this.chatNames = loadedSessions || [];
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
    await this.chatPersistence.loadMessages();
  }
}
