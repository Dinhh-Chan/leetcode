import { apiService, apiClient } from './api';
import { API_ENDPOINTS, API_CONFIG } from '@/constants';
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
    filters?: FilterOptions,
    condition?: any,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Always use /problems/many endpoint
    const endpoint = API_ENDPOINTS.problems.many;

    // Add condition parameter if exists
    if (condition && Object.keys(condition).length > 0) {
      params.append('condition', JSON.stringify(condition));
    }

    // Add sort and order
    if (sort) {
      params.append('sort', sort);
    }
    if (order) {
      params.append('order', order);
    }

    // Legacy filters support (for backward compatibility)
    if (filters) {
      if (filters.difficulty?.length && !condition?.difficulty) {
        params.append('difficulty', filters.difficulty.join(','));
      }
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.sortBy && !sort) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder && !order) {
        params.append('sortOrder', filters.sortOrder);
      }
    }

    const token = this.getToken();
    const res = await apiClient.get(`${endpoint}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const payload: any = res?.data ?? {};
    const dataLayer = payload?.data ?? payload ?? {};
    const resultArray = Array.isArray(dataLayer?.result)
      ? dataLayer.result
      : Array.isArray(dataLayer?.data)
        ? dataLayer.data
        : Array.isArray(payload?.result)
          ? payload.result
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

    const pageVal = Number(dataLayer.page ?? payload.page ?? 1);
    const limitVal = Number(dataLayer.limit ?? payload.limit ?? limit);
    const totalVal = Number(dataLayer.total ?? payload.total ?? resultArray.length ?? 0);
    const totalPagesVal = Number(
      dataLayer.totalPages ?? payload.totalPages ?? Math.max(1, Math.ceil((totalVal || resultArray.length || 0) / (limitVal || 1)))
    );

    return {
      success: typeof payload?.success === 'boolean' ? payload.success : true,
      data: resultArray as Problem[],
      pagination: {
        page: pageVal,
        limit: limitVal,
        total: totalVal,
        totalPages: totalPagesVal,
      },
    };
  }

  // Get problem by ID (string id supported)
  async getProblem(id: string): Promise<Problem> {
    const token = this.getToken();
    const response = await apiService.get<Problem>(
      `${API_ENDPOINTS.problems.detail(id)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response;
  }

  // Get course problem by course ID and problem ID
  async getCourseProblem(courseId: string, problemId: string): Promise<Problem> {
    const token = this.getToken();
    const response = await apiService.get<Problem>(
      `/courses/${courseId}/problems/${problemId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );
    return response;
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
  async searchProblems(params: {
    name: string;
    page?: number;
    limit?: number;
    difficulty?: number;
  }): Promise<ProblemsListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('name', params.name);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.difficulty) searchParams.set('difficulty', params.difficulty.toString());

    const url = `${API_ENDPOINTS.problems.search}?${searchParams.toString()}`;
    const res = await apiClient.get(url);
    const payload: any = res?.data ?? {};
    const dataLayer = payload?.data ?? payload ?? {};

    const extractArray = (source: any): Problem[] => {
      if (Array.isArray(source?.result)) return source.result as Problem[];
      if (Array.isArray(source?.data)) return source.data as Problem[];
      if (Array.isArray(source)) return source as Problem[];
      return [];
    };

    const items = extractArray(dataLayer);
    const pageVal = Number(dataLayer.page ?? payload.page ?? params.page ?? 1);
    const derivedLimit = dataLayer.limit ?? payload.limit ?? params.limit ?? (items.length ? items.length : undefined) ?? 20;
    const limitVal = Number(derivedLimit);
    const totalVal = Number(dataLayer.total ?? payload.total ?? items.length ?? 0);
    const totalPagesVal = Number(
      dataLayer.totalPages ?? payload.totalPages ?? Math.max(1, Math.ceil((totalVal || items.length || 0) / (limitVal || 1)))
    );

    return {
      success: typeof payload?.success === 'boolean' ? payload.success : true,
      data: items,
      pagination: {
        page: pageVal,
        limit: limitVal,
        total: totalVal,
        totalPages: totalPagesVal,
      },
    };
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

  // Get sub-topic problems with optional filters
  async getProblemsBySubTopic(
    subTopicId: string,
    options: {
      page?: number;
      limit?: number;
      q?: string;
      difficulty?: string; // e.g. "1,2,3"
      solved?: string; // "1" | "0"
      sort?: string; // JSON string, e.g. '{"difficulty":1}'
      withTestcases?: boolean;
    } = {}
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.q) params.set('q', options.q);
    if (options.difficulty) params.set('difficulty', options.difficulty);
    if (options.solved !== undefined) params.set('solved', options.solved);
    if (options.sort) params.set('sort', options.sort);

    const withTestcases = options.withTestcases ?? true;
    const basePath = withTestcases
      ? API_ENDPOINTS.problems.bySubTopic(subTopicId)
      : API_ENDPOINTS.problems.bySubTopicWithoutTestcases(subTopicId);

    const url = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const res = await apiClient.get(url);
      const payload: any = res?.data ?? {};

      let items: Problem[] = [];
      let page = Number(options.page || 1);
      let limit = Number(options.limit || 20);
      let total = 0;
      let totalPages = 1;

      const extractArray = (source: any): Problem[] => {
        if (Array.isArray(source)) return source as Problem[];
        if (source && typeof source === 'object') {
          if (Array.isArray(source.result)) return source.result as Problem[];
          if (Array.isArray(source.items)) return source.items as Problem[];
          if (Array.isArray(source.data)) return source.data as Problem[];
        }
        return [];
      };

      const resolveMeta = (source: any) => {
        if (!source || typeof source !== 'object') return undefined;
        if (source.meta && typeof source.meta === 'object') return source.meta;
        if (source.pagination && typeof source.pagination === 'object') return source.pagination;
        return undefined;
      };

      if (payload?.data) {
        items = extractArray(payload.data);
        const meta =
          resolveMeta(payload) ??
          resolveMeta(payload.data) ??
          resolveMeta(payload.meta) ??
          resolveMeta(payload.data?.meta) ??
          resolveMeta(payload.data?.pagination) ??
          {};

        const pageCandidate = payload.data.page ?? meta?.page ?? payload.page;
        const limitCandidate = payload.data.limit ?? meta?.limit ?? payload.limit;
        const totalCandidate = payload.data.total ?? meta?.total ?? payload.total;
        const totalPagesCandidate =
          payload.data.totalPages ?? meta?.totalPages ?? payload.totalPages;

        page = Number(pageCandidate ?? page);
        limit = Number(limitCandidate ?? limit);
        total = Number(totalCandidate ?? items.length ?? 0);
        totalPages = Number(
          totalPagesCandidate ??
            Math.max(1, Math.ceil((total || items.length || 0) / (limit || 1)))
        );
      } else {
        items = extractArray(payload);
        page = Number(payload.page ?? page);
        limit = Number(payload.limit ?? limit);
        total = Number(payload.total ?? items.length ?? 0);
        totalPages = Number(payload.totalPages ?? Math.max(1, Math.ceil((total || items.length || 0) / (limit || 1))));
      }

      return {
        success: typeof payload?.success === 'boolean' ? payload.success : true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get topic problems with optional filters
  async getProblemsByTopic(
    topicId: string,
    options: {
      page?: number;
      limit?: number;
      difficulty?: string; // e.g. "1,2,3"
      is_public?: boolean;
      sort?: string; // e.g. "difficulty"
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<ProblemsListResponse> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.difficulty) params.set('difficulty', options.difficulty);
    if (options.is_public !== undefined) params.set('is_public', String(options.is_public));
    if (options.sort) params.set('sort', options.sort);
    if (options.order) params.set('order', options.order);

    const url = `${API_ENDPOINTS.problems.byTopic(topicId)}${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const res = await apiClient.get(url);
      const payload: any = res?.data ?? {};

      let items: Problem[] = [];
      let page = Number(options.page || 1);
      let limit = Number(options.limit || 20);
      let total = 0;
      let totalPages = 1;
      let problemsCount = 0;

      const extractArray = (source: any): Problem[] => {
        if (Array.isArray(source)) return source as Problem[];
        if (source && typeof source === 'object') {
          if (Array.isArray(source.result)) return source.result as Problem[];
          if (Array.isArray(source.items)) return source.items as Problem[];
          if (Array.isArray(source.data)) return source.data as Problem[];
        }
        return [];
      };

      if (payload?.data) {
        items = extractArray(payload.data);
        const meta = payload.meta ?? payload.data?.meta ?? {};
        page = Number(meta.page ?? payload.data.page ?? page);
        limit = Number(meta.limit ?? payload.data.limit ?? limit);
        total = Number(meta.total ?? payload.data.total ?? items.length ?? 0);
        problemsCount = Number(meta.problems_count ?? payload.data.problems_count ?? total);
        totalPages = Number(meta.totalPages ?? payload.data.totalPages ?? Math.max(1, Math.ceil((total || items.length || 0) / (limit || 1))));
      } else {
        items = extractArray(payload.result || payload);
        page = Number(payload.page ?? page);
        limit = Number(payload.limit ?? limit);
        total = Number(payload.total ?? items.length ?? 0);
        problemsCount = Number(payload.problems_count ?? total);
        totalPages = Number(payload.totalPages ?? Math.max(1, Math.ceil((total || items.length || 0) / (limit || 1))));
      }

      return {
        success: typeof payload?.success === 'boolean' ? payload.success : true,
        data: items,
        pagination: {
          page,
          limit,
          total: problemsCount || total,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const problemsService = new ProblemsService();
