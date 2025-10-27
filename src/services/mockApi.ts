import { mockApiResponses, mockProblems, mockUser } from '@/data/mockData';
import { LoginForm, RegisterForm, CodeSubmission, FilterOptions } from '@/types';

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export class MockApiService {
  // Mock login
  async login(credentials: LoginForm) {
    await delay(500); // Simulate network delay
    
    if (credentials.email === 'demo@leetcode.com' && credentials.password === 'password') {
      return mockApiResponses.login;
    }
    
    throw new Error('Invalid credentials');
  }

  // Mock register
  async register(userData: RegisterForm) {
    await delay(500);
    
    return {
      user: {
        ...mockUser,
        username: userData.username,
        email: userData.email,
      },
      tokens: mockApiResponses.login.tokens,
    };
  }

  // Mock logout
  async logout() {
    await delay(200);
    return { message: 'Logged out successfully' };
  }

  // Mock get profile
  async getProfile() {
    await delay(300);
    return mockUser;
  }

  // Mock get problems
  async getProblems(page: number = 1, limit: number = 20, filters?: FilterOptions) {
    await delay(400);
    
    let filteredProblems = [...mockProblems];
    
    // Apply filters
    if (filters?.difficulty?.length) {
      filteredProblems = filteredProblems.filter(p => 
        filters.difficulty!.includes(p.difficulty)
      );
    }
    
    if (filters?.tags?.length) {
      filteredProblems = filteredProblems.filter(p =>
        p.tags.some(tag => filters.tags!.includes(tag))
      );
    }
    
    if (filters?.status?.length) {
      filteredProblems = filteredProblems.filter(p =>
        filters.status!.includes(p.status || 'null')
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      filteredProblems.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'difficulty':
            const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
            return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                   difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
          case 'acceptance':
            return b.acceptance - a.acceptance;
          default:
            return 0;
        }
      });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
    
    return {
      problems: paginatedProblems,
      pagination: {
        page,
        limit,
        total: filteredProblems.length,
        totalPages: Math.ceil(filteredProblems.length / limit),
      },
    };
  }

  // Mock get problem by ID
  async getProblem(id: number) {
    await delay(300);
    
    const problem = mockProblems.find(p => p.id === id);
    if (!problem) {
      throw new Error('Problem not found');
    }
    
    return problem;
  }

  // Mock submit solution
  async submitSolution(submission: CodeSubmission) {
    await delay(1000); // Simulate processing time
    
    const problem = mockProblems.find(p => p.id === submission.problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }
    
    // Mock submission result
    const isAccepted = Math.random() > 0.3; // 70% chance of acceptance
    
    return {
      submission: {
        id: Math.random().toString(36).substr(2, 9),
        problemId: submission.problemId,
        userId: mockUser.id,
        language: submission.language,
        code: submission.code,
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        runtime: Math.floor(Math.random() * 100) + 10,
        memory: Math.floor(Math.random() * 20) + 5,
        submittedAt: new Date().toISOString(),
      },
      result: {
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        runtime: Math.floor(Math.random() * 100) + 10,
        memory: Math.floor(Math.random() * 20) + 5,
        testCases: {
          passed: isAccepted ? 1000 : Math.floor(Math.random() * 800),
          total: 1000,
        },
        error: isAccepted ? undefined : 'Test case failed: Expected [0,1], got [1,0]',
      },
    };
  }

  // Mock get submissions
  async getSubmissions(problemId: number) {
    await delay(300);
    
    return [
      {
        id: '1',
        problemId,
        userId: mockUser.id,
        language: 'javascript',
        code: 'function solution() { return true; }',
        status: 'Accepted' as const,
        runtime: 45,
        memory: 12,
        submittedAt: '2024-01-10T08:30:00Z',
      },
      {
        id: '2',
        problemId,
        userId: mockUser.id,
        language: 'python',
        code: 'def solution(): return True',
        status: 'Wrong Answer' as const,
        runtime: 38,
        memory: 15,
        submittedAt: '2024-01-09T14:20:00Z',
      },
    ];
  }

  // Mock search problems
  async searchProblems(query: string, page: number = 1, limit: number = 20) {
    await delay(400);
    
    const filteredProblems = mockProblems.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
    
    return {
      problems: paginatedProblems,
      pagination: {
        page,
        limit,
        total: filteredProblems.length,
        totalPages: Math.ceil(filteredProblems.length / limit),
      },
    };
  }
}

// Create singleton instance
export const mockApiService = new MockApiService();
