// export interface ChatMessage {
//   role: 'user' | 'assistant' | 'form';
//   content: string | null;
//   timestamp?: Date;
//   sessionId?: number;
// }


// export interface ChatMessage {
//   role: 'user' | 'model' | 'form';
//   messages: string[];
//   sessionId: string;
// }

export interface EventMessage {
  type:string
  content: string
}

export interface event {
  role: 'user' | 'model' | 'form' | 'function_call';
  messages: EventMessage[];
}

export interface Events {
  events : event[]
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



export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: "assistant" | "user" | null;
      content?: string | null;
    };
    finish_reason: string | null;
  }>;
}
