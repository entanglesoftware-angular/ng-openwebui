// services/chat-persistence.service.ts
import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/chat-message.model';
import { ChatSession } from '../models/chat-session.model';

@Injectable({
  providedIn: 'root'
})
export abstract class ChatPersistenceService {
  abstract saveMessage(message: ChatMessage): void | Promise<void>;
  abstract loadMessages(): Promise<ChatMessage[]>;
  abstract clearMessages(): void | Promise<void>;
  abstract saveSession(): Promise<ChatSession>;
  abstract loadSessions(): Promise<ChatSession[]>;
}
