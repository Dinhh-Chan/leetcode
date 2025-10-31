// Problems service types
export interface Topic {
  _id: string;
  name?: string;
  [key: string]: any;
}

export interface SubTopic {
  _id: string;
  name?: string;
  [key: string]: any;
}

export interface TestCase {
  _id?: string;
  input?: string;
  expected_output?: string;
  [key: string]: any;
}

export interface Problem {
  _id: string;
  topic_id: string;
  sub_topic_id: string;
  name: string;
  description: string;
  difficulty: number; // 1 = Easy, 2 = Medium, 3 = Hard
  code_template: string;
  guidelines?: string;
  solution?: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  number_of_tests: number;
  is_public: boolean;
  is_active: boolean;
  // Added from API to indicate if current user solved the problem
  is_done?: boolean;
  topic?: Topic;
  sub_topic?: SubTopic;
  test_cases?: TestCase[];
  sets?: string;
  steps?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Submission {
  id: string;
  problemId: number;
  userId: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compile Error';
  runtime: number; // in ms
  memory: number; // in MB
  submittedAt: string;
}

export interface FilterOptions {
  difficulty?: string[];
  tags?: string[];
  status?: string[];
  sortBy?: 'acceptance' | 'difficulty' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CodeSubmission {
  problemId: number;
  language: string;
  code: string;
}

// API Response from backend
export interface ProblemsListApiResponse {
  success: boolean;
  data: {
    page: number;
    skip: number;
    limit: number;
    total: number;
    result: Problem[];
  };
}

// Transformed response for frontend use
export interface ProblemsListResponse {
  success: boolean;
  data: Problem[];
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
