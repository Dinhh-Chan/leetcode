import axios from 'axios';
import { apiClient } from './api';

export interface ContestSubmitRequest {
  contest_id: string;
  problem_id: string;
  language_id: number;
  code: string;
}

export interface ContestSubmitResponse {
  success: boolean;
  data: {
    _id: string;
    submission_id: string;
    contest_id: string;
    student_id: string;
    code: string;
    language_id: number;
    status: string;
    score: string;
    execution_time_ms: number;
    memory_used_mb: string;
    test_cases_passed: number;
    total_test_cases: number;
    problem_id: string;
    submitted_at: string;
    solved_at?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ContestSubmissionDetailResponse {
  success: boolean;
  data: ContestSubmitResponse['data'];
}

export interface ContestSubmissionsListResponse {
  success: boolean;
  data: ContestSubmitResponse['data'][];
}

export const contestSubmissionsService = {
  async submit(request: ContestSubmitRequest): Promise<ContestSubmitResponse> {
    const res = await apiClient.post<ContestSubmitResponse>(
      '/contest-submissions/submit',
      request
    );
    return res.data;
  },
  
  async getSubmissionDetail(submissionId: string): Promise<ContestSubmissionDetailResponse> {
    const res = await apiClient.get<ContestSubmissionDetailResponse>(
      `/contest-submissions/${submissionId}`
    );
    return res.data;
  },

  async getSubmissionsByContestAndProblem(contestId: string, problemId: string): Promise<ContestSubmissionsListResponse> {
    const res = await apiClient.get<ContestSubmissionsListResponse>(
      `/contest-submissions/contest/${contestId}/problem/${problemId}`
    );
    return res.data;
  },
};

