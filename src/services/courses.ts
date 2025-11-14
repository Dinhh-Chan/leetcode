import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants';
import { Course, CoursesResponse, JoinCourseRequest, JoinCourseResponse } from './types/courses';
import { authService } from './auth/authService';

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

  // Get course by ID
  async getCourse(id: string): Promise<Course> {
    const token = this.getToken();
    const response = await axios.get<{ data: Course; success: boolean }>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.courses.detail(id)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response.data.data;
  }

  // Join course
  async joinCourse(courseId: string): Promise<JoinCourseResponse> {
    const token = this.getToken();
    const user = authService.getCurrentUser();
    
    if (!user || !user._id) {
      throw new Error('User not found');
    }

    const request: JoinCourseRequest = {
      course_id: courseId,
      student_id: user._id,
      join_at: new Date().toISOString(),
    };

    const response = await axios.post<JoinCourseResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.courses.join}`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  }
}

// Create singleton instance
export const coursesService = new CoursesService();

