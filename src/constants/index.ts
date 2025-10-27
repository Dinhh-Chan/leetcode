// Application constants
export const APP_CONFIG = {
  name: 'LeetCode Clone',
  version: '1.0.0',
  description: 'A modern LeetCode clone built with React and TypeScript',
  author: 'Your Name',
  repository: 'https://github.com/yourusername/leetcode-clone',
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://live-code-be-2.ript.vn/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  // Problems
  problems: {
    list: '/problems',
    detail: (id: number) => `/problems/${id}`,
    submit: '/problems/submit',
    submissions: (problemId: number) => `/problems/${problemId}/submissions`,
  },
  // Contests
  contests: {
    list: '/contests',
    detail: (id: string) => `/contests/${id}`,
    join: (id: string) => `/contests/${id}/join`,
    leaderboard: (id: string) => `/contests/${id}/leaderboard`,
  },
  // Discussions
  discussions: {
    list: '/discussions',
    detail: (id: string) => `/discussions/${id}`,
    create: '/discussions',
    comment: (id: string) => `/discussions/${id}/comments`,
  },
  // Users
  users: {
    profile: (id: string) => `/users/${id}`,
    stats: (id: string) => `/users/${id}/stats`,
    submissions: (id: string) => `/users/${id}/submissions`,
  },
} as const;

// Problem difficulties
export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium', 
  HARD: 'Hard',
} as const;

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: 'text-green-600',
  [DIFFICULTY_LEVELS.MEDIUM]: 'text-yellow-600',
  [DIFFICULTY_LEVELS.HARD]: 'text-red-600',
} as const;

// Problem status
export const PROBLEM_STATUS = {
  SOLVED: 'solved',
  ATTEMPTED: 'attempted',
  NOT_ATTEMPTED: null,
} as const;

// Programming languages
export const PROGRAMMING_LANGUAGES = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  C: 'c',
  CSHARP: 'csharp',
  GO: 'go',
  RUST: 'rust',
  SWIFT: 'swift',
  KOTLIN: 'kotlin',
} as const;

export const LANGUAGE_LABELS = {
  [PROGRAMMING_LANGUAGES.JAVASCRIPT]: 'JavaScript',
  [PROGRAMMING_LANGUAGES.TYPESCRIPT]: 'TypeScript',
  [PROGRAMMING_LANGUAGES.PYTHON]: 'Python',
  [PROGRAMMING_LANGUAGES.JAVA]: 'Java',
  [PROGRAMMING_LANGUAGES.CPP]: 'C++',
  [PROGRAMMING_LANGUAGES.C]: 'C',
  [PROGRAMMING_LANGUAGES.CSHARP]: 'C#',
  [PROGRAMMING_LANGUAGES.GO]: 'Go',
  [PROGRAMMING_LANGUAGES.RUST]: 'Rust',
  [PROGRAMMING_LANGUAGES.SWIFT]: 'Swift',
  [PROGRAMMING_LANGUAGES.KOTLIN]: 'Kotlin',
} as const;

// Problem tags
export const PROBLEM_TAGS = {
  ARRAY: 'Array',
  STRING: 'String',
  HASH_TABLE: 'Hash Table',
  DYNAMIC_PROGRAMMING: 'Dynamic Programming',
  MATH: 'Math',
  SORTING: 'Sorting',
  GREEDY: 'Greedy',
  DEPTH_FIRST_SEARCH: 'Depth-First Search',
  BREADTH_FIRST_SEARCH: 'Breadth-First Search',
  BINARY_SEARCH: 'Binary Search',
  TWO_POINTERS: 'Two Pointers',
  STACK: 'Stack',
  QUEUE: 'Queue',
  LINKED_LIST: 'Linked List',
  TREE: 'Tree',
  GRAPH: 'Graph',
  BACKTRACKING: 'Backtracking',
  HEAP: 'Heap',
  TRIE: 'Trie',
  BIT_MANIPULATION: 'Bit Manipulation',
  SLIDING_WINDOW: 'Sliding Window',
  UNION_FIND: 'Union Find',
  SEGMENT_TREE: 'Segment Tree',
  BINARY_INDEXED_TREE: 'Binary Indexed Tree',
} as const;

// Theme configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'leetcode-theme',
  USER_PREFERENCES: 'leetcode-user-preferences',
  CODE_TEMPLATES: 'leetcode-code-templates',
  RECENT_PROBLEMS: 'leetcode-recent-problems',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  SUBMISSION_SUCCESS: 'Code submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { label: 'Explore', path: '/', exact: true },
  { label: 'Problems', path: '/problems' },
  { label: 'Contest', path: '/contest' },
  { label: 'Discuss', path: '/discuss' },
  { label: 'Interview', path: '/interview', hasDropdown: true },
  { label: 'Store', path: '/store', hasDropdown: true },
] as const;
