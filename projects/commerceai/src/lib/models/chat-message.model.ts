export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | null;
  timestamp?: Date;
  sessionId?: Number;
}