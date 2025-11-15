import axios from 'axios';
import { apiClient } from './api';

export interface SubmitRequest {
  student_id: string;
  problem_id: string;
  language_id: number;
  code: string;
}

export interface SubmitResponse {
  success: boolean;
  data: {
    _id: string;
    submission_id: string;
    student_id: string;
    class_id: string | null;
    judge_node_id: string;
    code: string;
    language_id: number;
    status: string;
    score: string;
    execution_time_ms: number;
    memory_used_mb: string;
    test_cases_passed: number;
    total_test_cases: number;
    error_message: string | null;
    submission_token: string;
    submitted_at: string;
    judged_at: string;
    createdAt: string;
    updatedAt: string;
    problem: any;
    student: any;
  };
}

export interface SubmissionDetailResponse {
  success: boolean;
  data: SubmitResponse['data'];
}

export interface RankingUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  systemRole: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RankingItem {
  rankNumber: number;
  user: RankingUser;
  totalProblemsSolved: number;
}

export interface RankingResponse {
  success: boolean;
  data: RankingItem[];
}

export interface ProblemSubmissionsResponse {
  success: boolean;
  data: SubmitResponse['data'][];
}

export const submissionsService = {
  async submit(request: SubmitRequest): Promise<SubmitResponse> {
    const res = await apiClient.post<SubmitResponse>(
      '/student-submissions/submit',
      request
    );
    return res.data;
  },
  
  async getSubmissionDetail(submissionId: string): Promise<SubmissionDetailResponse> {
    const res = await apiClient.get<SubmissionDetailResponse>(
      `/student-submissions/${submissionId}`
    );
    return res.data;
  },

  async getRanking(limit: number = 200): Promise<RankingResponse> {
    const res = await apiClient.get<RankingResponse>(
      `/student-submissions/ranking?limit=${limit}`
    );
    return res.data;
  },

  async getProblemSubmissions(problemId: string): Promise<ProblemSubmissionsResponse> {
    const res = await apiClient.get<ProblemSubmissionsResponse>(
      `/student-submissions/problem/${problemId}/submissions`
    );
    return res.data;
  },
};

