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
};

