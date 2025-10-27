import { User, Problem, Contest, Discussion } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  username: 'demo_user',
  email: 'demo@leetcode.com',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  solvedProblems: 150,
  totalProblems: 3715,
  rank: 1250,
  streak: 7,
  joinDate: '2023-01-15',
};

// Mock problems data
export const mockProblems: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    acceptance: 56.4,
    status: 'solved',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    hints: ['A really brute force way would be to search for all possible pairs of numbers but that would be too slow.'],
    isPremium: false,
    likes: 12500,
    dislikes: 1200,
  },
  {
    id: 2,
    title: 'Add Two Numbers',
    slug: 'add-two-numbers',
    difficulty: 'Medium',
    acceptance: 47.1,
    status: 'attempted',
    tags: ['Linked List', 'Math', 'Recursion'],
    description: 'You are given two non-empty linked lists representing two non-negative integers.',
    examples: [
      {
        input: 'l1 = [2,4,3], l2 = [5,6,4]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807.'
      }
    ],
    constraints: [
      'The number of nodes in each linked list is in the range [1, 100].',
      '0 <= Node.val <= 9'
    ],
    hints: [],
    isPremium: false,
    likes: 8900,
    dislikes: 2100,
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    acceptance: 37.7,
    status: null,
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    hints: [],
    isPremium: false,
    likes: 15600,
    dislikes: 1800,
  },
  {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    acceptance: 44.9,
    status: null,
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.'
      }
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000'
    ],
    hints: [],
    isPremium: true,
    likes: 9800,
    dislikes: 3200,
  },
  {
    id: 2273,
    title: 'Find Resultant Array After Removing Anagrams',
    slug: 'find-resultant-array-after-removing-anagrams',
    difficulty: 'Easy',
    acceptance: 62.6,
    status: null,
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    description: 'You are given a 0-indexed string array words, where words[i] consists of lowercase English letters.',
    examples: [
      {
        input: 'words = ["abba","baba","bbaa","cd","cd"]',
        output: '["abba","cd"]',
        explanation: 'One of the ways we can obtain the resultant array is by using the following operations:'
      }
    ],
    constraints: [
      '1 <= words.length <= 100',
      '1 <= words[i].length <= 10'
    ],
    hints: [],
    isPremium: false,
    likes: 3200,
    dislikes: 800,
  },
];

// Mock contests data
export const mockContests: Contest[] = [
  {
    id: 'weekly-contest-350',
    title: 'Weekly Contest 350',
    description: 'Weekly programming contest with 4 problems',
    startTime: '2024-01-14T10:30:00Z',
    endTime: '2024-01-14T12:00:00Z',
    duration: 90,
    participants: 12500,
    isLive: true,
    isUpcoming: false,
    isFinished: false,
  },
  {
    id: 'biweekly-contest-120',
    title: 'Biweekly Contest 120',
    description: 'Biweekly programming contest with 4 problems',
    startTime: '2024-01-20T15:00:00Z',
    endTime: '2024-01-20T16:30:00Z',
    duration: 90,
    participants: 8900,
    isLive: false,
    isUpcoming: true,
    isFinished: false,
  },
];

// Mock discussions data
export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    problemId: 1,
    title: 'Clean Java Solution with Explanation',
    content: 'Here is my solution using HashMap...',
    author: mockUser,
    upvotes: 245,
    downvotes: 12,
    comments: [],
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-10T08:30:00Z',
  },
  {
    id: '2',
    problemId: 2,
    title: 'Python Solution - Easy to Understand',
    content: 'This is a straightforward approach...',
    author: {
      ...mockUser,
      id: '2',
      username: 'python_master',
      email: 'python@example.com',
    },
    upvotes: 189,
    downvotes: 8,
    comments: [],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
  },
];

// Mock API responses
export const mockApiResponses = {
  login: {
    user: mockUser,
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  },
  problems: {
    problems: mockProblems,
    pagination: {
      page: 1,
      limit: 20,
      total: mockProblems.length,
      totalPages: 1,
    },
  },
  contests: mockContests,
  discussions: mockDiscussions,
};
