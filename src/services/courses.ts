import axios from 'axios';
import { API_CONFIG } from '@/constants';
import { Course, CoursesResponse } from './types/courses';

class CoursesService {
  // Get auth token
  private getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  // Get active courses
  async getActiveCourses(): Promise<Course[]> {
    const token = this.getToken();
    const response = await axios.get<CoursesResponse>(
      `${API_CONFIG.baseURL}/courses/active`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data.data;
  }
}

// Create singleton instance
export const coursesService = new CoursesService();

