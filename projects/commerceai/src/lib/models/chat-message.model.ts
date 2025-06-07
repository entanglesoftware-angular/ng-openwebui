// export interface ChatMessage {
//   role: 'user' | 'assistant' | 'form';
//   content: string | null;
//   timestamp?: Date;
//   sessionId?: number;
// }


export interface ChatMessage {
  role: 'user' | 'model' | 'form';
  messages: string[];
  sessionId: string;
}
