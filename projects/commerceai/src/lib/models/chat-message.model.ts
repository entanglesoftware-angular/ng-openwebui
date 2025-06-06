export interface ChatMessage {
  role: 'user' | 'assistant' | 'form';
  content: string | null;
  timestamp?: Date;
  sessionId?: number;
}