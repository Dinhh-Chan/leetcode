import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/constants';
import { SubTopicItem, SubTopicsManyApiResponse } from '@/services/types/subtopics';

class SubTopicsService {
  async getMany(): Promise<SubTopicItem[]> {
    // Using generic apiService.get which returns `data` directly
    const data = await apiService.get<SubTopicsManyApiResponse['data']>(API_ENDPOINTS.subTopics.many);
    return data;
  }
}

export const subTopicsService = new SubTopicsService();













