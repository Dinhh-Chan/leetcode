import { apiService } from './api';
import { API_ENDPOINTS, API_CONFIG } from '@/constants';
import axios from 'axios';
import { Problem, ProblemsListApiResponse, ProblemsListResponse, SubmissionResponse } from './types/problems';
import { FilterOptions, CodeSubmission, Submission } from '@/types';

class ProblemsService {
  // Get auth token
  private getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  // Get problems list with filters and pagination
  async getProblems(
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.difficulty?.length) {
        params.append('difficulty', filters.difficulty.join(','));
      }
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
    }

    const token = this.getToken();
    const response = await axios.get<ProblemsListApiResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.problems.list}?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    // Transform API response to match expected format
    const apiResponse = response.data;
    return {
      success: apiResponse.success,
      data: apiResponse.data.result,
      pagination: {
        page: apiResponse.data.page,
        limit: apiResponse.data.limit,
        total: apiResponse.data.total,
        totalPages: Math.ceil(apiResponse.data.total / apiResponse.data.limit),
      },
    } as ProblemsListResponse;
  }

  // Get problem by ID (string id supported)
  async getProblem(id: string): Promise<Problem> {
    const token = this.getToken();
    const response = await axios.get<{ data: Problem; success: boolean }>(
      `${API_CONFIG.baseURL}/problems/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response.data.data as unknown as Problem;
  }

  // Get problem by slug
  async getProblemBySlug(slug: string): Promise<Problem> {
    return apiService.get<Problem>(`/problems/slug/${slug}`);
  }

  // Submit solution
  async submitSolution(submission: CodeSubmission): Promise<SubmissionResponse> {
    return apiService.post<SubmissionResponse>(
      API_ENDPOINTS.problems.submit,
      submission
    );
  }

  // Get user's submissions for a problem
  async getSubmissions(problemId: number): Promise<Submission[]> {
    return apiService.get<Submission[]>(
      API_ENDPOINTS.problems.submissions(problemId)
    );
  }

  // Get all user submissions
  async getAllSubmissions(page: number = 1, limit: number = 20): Promise<{
    submissions: Submission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get(
      `/submissions?${params.toString()}`
    );
  }

  // Get submission by ID
  async getSubmission(id: string): Promise<Submission> {
    return apiService.get<Submission>(`/submissions/${id}`);
  }

  // Like a problem
  async likeProblem(problemId: number): Promise<void> {
    await apiService.post(`/problems/${problemId}/like`);
  }

  // Unlike a problem
  async unlikeProblem(problemId: number): Promise<void> {
    await apiService.delete(`/problems/${problemId}/like`);
  }

  // Get problem statistics
  async getProblemStats(problemId: number): Promise<{
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    difficultyDistribution: {
      easy: number;
      medium: number;
      hard: number;
    };
    languageDistribution: Record<string, number>;
  }> {
    return apiService.get(`/problems/${problemId}/stats`);
  }

  // Get random problem
  async getRandomProblem(difficulty?: string, tags?: string[]): Promise<Problem> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (tags?.length) params.append('tags', tags.join(','));

    return apiService.get<Problem>(
      `/problems/random?${params.toString()}`
    );
  }

  // Get similar problems
  async getSimilarProblems(problemId: number): Promise<Problem[]> {
    return apiService.get<Problem[]>(`/problems/${problemId}/similar`);
  }

  // Get problem discussion count
  async getProblemDiscussionCount(problemId: number): Promise<number> {
    const response = await apiService.get<{ count: number }>(
      `/problems/${problemId}/discussions/count`
    );
    return response.count;
  }

  // Search problems
  async searchProblems(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get<ProblemsListResponse>(
      `/problems/search?${params.toString()}`
    );
  }

  // Get trending problems
  async getTrendingProblems(limit: number = 10): Promise<Problem[]> {
    return apiService.get<Problem[]>(`/problems/trending?limit=${limit}`);
  }

  // Get recently solved problems
  async getRecentlySolved(limit: number = 10): Promise<Problem[]> {
    return apiService.get<Problem[]>(`/problems/recently-solved?limit=${limit}`);
  }

  // Get problem tags
  async getProblemTags(): Promise<string[]> {
    return apiService.get<string[]>('/problems/tags');
  }

  // Get problems by tag
  async getProblemsByTag(
    tag: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get<ProblemsListResponse>(
      `/problems/tag/${tag}?${params.toString()}`
    );
  }

  // Get problems by sub-topic with filters and pagination
  async getProblemsBySubTopic(
    subTopicId: string,
    options: {
      page?: number;
      limit?: number;
      q?: string;
      difficulty?: string; // e.g. "1,2,3"
      solved?: string; // "1" | "0"
      sort?: string; // JSON string, e.g. '{"difficulty":1}'
    } = {}
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.q) params.set('q', options.q);
    if (options.difficulty) params.set('difficulty', options.difficulty);
    if (options.solved !== undefined) params.set('solved', options.solved);
    if (options.sort) params.set('sort', options.sort);

    // Expect API returns shape similar to basic list; fallback if not
    const url = `${API_ENDPOINTS.problems.bySubTopic(subTopicId)}${params.toString() ? `?${params.toString()}` : ''}`;
    try {
      const res = await axios.get<ProblemsListApiResponse>(`${API_CONFIG.baseURL}${url}`);
      const api = res.data;
      return {
        success: api.success,
        data: api.data.result,
        pagination: {
          page: api.data.page,
          limit: api.data.limit,
          total: api.data.total,
          totalPages: Math.ceil(api.data.total / api.data.limit),
        },
      };
    } catch {
      // Fallback for API returning {success, data: Problem[]}
      const data = await apiService.get<{ success: boolean; data: Problem[] }>(url);
      return {
        success: true,
        data: (data as any).data || (data as any),
        pagination: {
          page: Number(options.page || 1),
          limit: Number(options.limit || 20),
          total: ((data as any).data || (data as any))?.length || 0,
          totalPages: 1,
        },
      } as ProblemsListResponse;
    }
  }
}

// Create singleton instance
export const problemsService = new ProblemsService();
