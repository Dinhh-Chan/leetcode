import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/constants';
import { TopicItem, TopicsManyApiResponse } from '@/services/types/topics';

class TopicsService {
  async getMany(): Promise<TopicItem[]> {
    const data = await apiService.get<TopicsManyApiResponse['data']>(API_ENDPOINTS.topics.many);
    return data;
  }
}

export const topicsService = new TopicsService();
