// Common types for the application
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  solvedProblems: number;
  totalProblems: number;
  rank?: number;
  streak: number;
  joinDate: string;
}

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

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  participants: number;
  isLive: boolean;
  isUpcoming: boolean;
  isFinished: boolean;
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

export interface Discussion {
  id: string;
  problemId: number;
  title: string;
  content: string;
  author: User;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface FilterOptions {
  difficulty?: string[];
  tags?: string[];
  status?: string[];
  sortBy?: 'acceptance' | 'difficulty' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CodeSubmission {
  problemId: number;
  language: string;
  code: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  label: string;
  path: string;
  active?: boolean;
  hasDropdown?: boolean;
  children?: NavItem[];
}
