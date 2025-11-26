import { apiService } from '@/services/api';
import { ChatWithAiDto, ChatWithAiResponse, Message, MessagesListResponse } from '@/services/types/messages';

class MessagesService {
  /**
   * Chat với AI về bài tập
   */
  async chatWithAI(data: ChatWithAiDto): Promise<{ userMessage: Message; aiMessage: Message }> {
    const response = await apiService.post<ChatWithAiResponse['data']>('/messages/chat', data);
    return response;
  }

  /**
   * Lấy danh sách messages theo session
   */
  async getBySessionId(sessionId: string): Promise<Message[]> {
    const response = await apiService.get<MessagesListResponse['data']>(`/messages/by-session/${sessionId}`);
    return response;
  }

  /**
   * Lấy danh sách tất cả messages (admin only)
   */
  async getMany(): Promise<Message[]> {
    const response = await apiService.get<MessagesListResponse['data']>('/messages/many');
    return response;
  }

  /**
   * Xóa message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete(`/messages/${messageId}`);
  }
}

export const messagesService = new MessagesService();

