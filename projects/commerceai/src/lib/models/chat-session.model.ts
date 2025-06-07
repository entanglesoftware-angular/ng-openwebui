// export interface ChatSession {
//   sessionId?: number;
//   title?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   userId: number;
// }

// src/app/models/chat-session.model.ts
export interface ChatSession {
  id: string;
  app_name: string;
  user_id: string;
  state: any;
  events: any[];
  last_update_time: number;
  title?: string;
}
