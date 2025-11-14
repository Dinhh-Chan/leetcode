import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsService } from '@/services/problems';
import { Problem, ProblemsListResponse } from '@/services/types/problems';
import { FilterOptions, CodeSubmission } from '@/types';
import { toast } from 'sonner';
import { FilterCondition } from '@/components/FilterDialog';
import { useAuthContext } from '@/contexts/AuthContext';

export const useProblems = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filterCondition, setFilterCondition] = useState<FilterCondition | null>(null);
  const [sort, setSort] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc' | null>(null);

  // Build condition from search query and filter
  const buildCondition = useCallback((): FilterCondition | null => {
    const condition: FilterCondition = filterCondition ? { ...filterCondition } : {};

    // Add search query as regex if exists (merge with existing name filter if any)
    if (searchQuery.trim()) {
      condition.name = { $regex: searchQuery.trim() };
    }

    // Check if there are any filters applied
    const hasFilters = Object.keys(condition).length > 0;

    // Auto filter is_public = true if user is STUDENT and has other filters
    // Only apply auto-filter when there are other filters to avoid sending condition when no filters
    if (user?.systemRole === 'Student' && hasFilters && condition.is_public === undefined) {
      condition.is_public = true;
    }

    // Return null if no filters (don't send condition parameter)
    if (Object.keys(condition).length === 0) {
      return null;
    }

    return condition;
  }, [filterCondition, searchQuery, user]);

  // Get problems list
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    error: problemsError,
    refetch: refetchProblems,
    isFetching: isFetchingProblems,
  } = useQuery<ProblemsListResponse>({
    queryKey: ['problems', currentPage, pageSize, filterCondition, searchQuery, sort, order],
    queryFn: () => {
      const condition = buildCondition();
      return problemsService.getProblems(currentPage, pageSize, filters, condition, sort || undefined, order || undefined);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });

  // Submit solution mutation
  const submitSolutionMutation = useMutation({
    mutationFn: (submission: CodeSubmission) => problemsService.submitSolution(submission),
    onSuccess: (data) => {
      toast.success('Code submitted successfully!');
      // Invalidate problems query to refresh status
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  // Like problem mutation
  const likeProblemMutation = useMutation({
    mutationFn: (problemId: number) => problemsService.likeProblem(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to like problem');
    },
  });

  // Unlike problem mutation
  const unlikeProblemMutation = useMutation({
    mutationFn: (problemId: number) => problemsService.unlikeProblem(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unlike problem');
    },
  });

  // Get problem by ID
  const useProblem = (id: string) => {
    return useQuery({
      queryKey: ['problem', id],
      queryFn: () => problemsService.getProblem(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get problem submissions
  const useProblemSubmissions = (problemId: number) => {
    return useQuery({
      queryKey: ['problem-submissions', problemId],
      queryFn: () => problemsService.getSubmissions(problemId),
      enabled: !!problemId,
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  // Get all user submissions
  const useAllSubmissions = (page: number = 1, limit: number = 20) => {
    return useQuery({
      queryKey: ['submissions', page, limit],
      queryFn: () => problemsService.getAllSubmissions(page, limit),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  // Search problems
  const searchProblems = useCallback(async (query: string, page: number = 1, difficulty?: number) => {
    return problemsService.searchProblems({
      name: query,
      page,
      limit: pageSize,
      difficulty,
    });
  }, [pageSize]);

  // Get random problem
  const getRandomProblem = useCallback(async (difficulty?: string, tags?: string[]) => {
    return problemsService.getRandomProblem(difficulty, tags);
  }, []);

  // Get similar problems
  const getSimilarProblems = useCallback(async (problemId: number) => {
    return problemsService.getSimilarProblems(problemId);
  }, []);

  // Get trending problems
  const getTrendingProblems = useCallback(async (limit: number = 10) => {
    return problemsService.getTrendingProblems(limit);
  }, []);

  // Get recently solved problems
  const getRecentlySolved = useCallback(async (limit: number = 10) => {
    return problemsService.getRecentlySolved(limit);
  }, []);

  // Get problem tags
  const getProblemTags = useCallback(async () => {
    return problemsService.getProblemTags();
  }, []);

  // Get problems by tag
  const getProblemsByTag = useCallback(async (tag: string, page: number = 1) => {
    return problemsService.getProblemsByTag(tag, page, pageSize);
  }, [pageSize]);

  // Submit solution
  const submitSolution = useCallback(
    async (submission: CodeSubmission) => {
      return submitSolutionMutation.mutateAsync(submission);
    },
    [submitSolutionMutation]
  );

  // Like problem
  const likeProblem = useCallback(
    async (problemId: number) => {
      return likeProblemMutation.mutateAsync(problemId);
    },
    [likeProblemMutation]
  );

  // Unlike problem
  const unlikeProblem = useCallback(
    async (problemId: number) => {
      return unlikeProblemMutation.mutateAsync(problemId);
    },
    [unlikeProblemMutation]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Update filter condition
  const updateFilterCondition = useCallback((condition: FilterCondition | null) => {
    setFilterCondition(condition);
    setCurrentPage(1);
  }, []);

  // Update sort
  const updateSort = useCallback((newSort: string | null, newOrder: 'asc' | 'desc' | null) => {
    setSort(newSort);
    setOrder(newOrder);
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
    setCurrentPage(1);
  }, []);

  // Update pagination
  const updatePagination = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  }, []);

  return {
    // State
    problems: problemsData?.data || [],
    pagination: problemsData?.pagination,
    filters,
    filterCondition,
    sort,
    order,
    currentPage,
    pageSize,
    searchQuery,
    isLoading: isLoadingProblems,
    isFetching: isFetchingProblems,
    error: problemsError,
    
    // Actions
    submitSolution,
    likeProblem,
    unlikeProblem,
    searchProblems,
    getRandomProblem,
    getSimilarProblems,
    getTrendingProblems,
    getRecentlySolved,
    getProblemTags,
    getProblemsByTag,
    updateFilters,
    updateFilterCondition,
    updateSort,
    updatePagination,
    refetchProblems,
    setSearchQuery,
    
    // Hooks
    useProblem,
    useProblemSubmissions,
    useAllSubmissions,
    
    // Mutation states
    isSubmitting: submitSolutionMutation.isPending,
    isLiking: likeProblemMutation.isPending,
    isUnliking: unlikeProblemMutation.isPending,
    
    // Errors
    submitError: submitSolutionMutation.error,
    likeError: likeProblemMutation.error,
    unlikeError: unlikeProblemMutation.error,
  };
};

export type UseProblemsResult = ReturnType<typeof useProblems>;
