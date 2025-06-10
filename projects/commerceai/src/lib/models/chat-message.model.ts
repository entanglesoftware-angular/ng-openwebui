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

export interface ChatReqMessage {
  role: 'user' | 'model' | 'form';
  type: string;
  content: string;
}

export interface ChatReq {
  model: string;
  messages: ChatReqMessage[];
  stream: boolean;
}

