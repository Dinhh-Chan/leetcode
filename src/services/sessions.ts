import { apiService } from '@/services/api';
import { CreateSessionDto, CreateSessionResponse, Session, SessionsListResponse } from '@/services/types/sessions';

class SessionsService {
  /**
   * Tạo session mới
   */
  async createSession(data: CreateSessionDto): Promise<Session> {
    const response = await apiService.post<CreateSessionResponse['data']>('/sessions', data);
    return response;
  }

  /**
   * Lấy danh sách sessions của user hiện tại
   */
  async getMySessions(): Promise<Session[]> {
    const response = await apiService.get<SessionsListResponse['data']>('/sessions/my-sessions');
    return response;
  }

  /**
   * Lấy danh sách tất cả sessions (admin only)
   */
  async getMany(): Promise<Session[]> {
    const response = await apiService.get<SessionsListResponse['data']>('/sessions/many');
    return response;
  }

  /**
   * Xóa session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiService.delete(`/sessions/${sessionId}`);
  }
}

export const sessionsService = new SessionsService();

