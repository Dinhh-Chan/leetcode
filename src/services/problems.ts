import { apiService } from './api';
import { mockApiService } from './mockApi';
import { API_ENDPOINTS } from '@/constants';
import { Problem, Submission, FilterOptions, CodeSubmission, ApiResponse } from '@/types';

// Use mock API in development
const isDevelopment = import.meta.env.DEV;
const api = isDevelopment ? mockApiService : apiService;

export interface ProblemsListResponse {
  problems: Problem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmissionResponse {
  submission: Submission;
  result: {
    status: string;
    runtime: number;
    memory: number;
    testCases: {
      passed: number;
      total: number;
    };
    error?: string;
  };
}

class ProblemsService {
  // Get problems list with filters and pagination
  async getProblems(
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<ProblemsListResponse> {
    if (isDevelopment) {
      return mockApiService.getProblems(page, limit, filters);
    }

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

    return apiService.get<ProblemsListResponse>(
      `${API_ENDPOINTS.problems.list}?${params.toString()}`
    );
  }

  // Get problem by ID
  async getProblem(id: number): Promise<Problem> {
    return isDevelopment 
      ? await mockApiService.getProblem(id)
      : await apiService.get<Problem>(API_ENDPOINTS.problems.detail(id));
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
}

// Create singleton instance
export const problemsService = new ProblemsService();
