// Messages service types
export type MessageRole = 'user' | 'assistant';

export interface Message {
  _id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatWithAiDto {
  session_id: string;
  content: string;
  problem_id?: string;
}

export interface ChatWithAiResponse {
  success: boolean;
  data: {
    userMessage: Message;
    aiMessage: Message;
  };
}

export interface MessagesListResponse {
  success: boolean;
  data: Message[];
}

