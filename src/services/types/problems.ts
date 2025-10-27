// Problems service types
export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: number;
  status?: 'solved' | 'attempted' | null;
  tags: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints?: string[];
  isPremium?: boolean;
  likes: number;
  dislikes: number;
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
