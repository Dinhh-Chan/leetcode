// Sessions service types
export interface Session {
  _id: string;
  user_id: string;
  session_name: string;
  question_id?: string;
  question_content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSessionDto {
  session_name: string;
  question_id?: string;
  question_content?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  data: Session;
}

export interface SessionsListResponse {
  success: boolean;
  data: Session[];
}

