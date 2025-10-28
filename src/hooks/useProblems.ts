import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsService } from '@/services/problems';
import { Problem, ProblemsListResponse } from '@/services/types/problems';
import { FilterOptions, CodeSubmission } from '@/types';
import { toast } from 'sonner';

export const useProblems = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Get problems list
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    error: problemsError,
    refetch: refetchProblems,
  } = useQuery({
    queryKey: ['problems', currentPage, pageSize, filters],
    queryFn: () => problemsService.getProblems(currentPage, pageSize, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
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
  const searchProblems = useCallback(async (query: string, page: number = 1) => {
    return problemsService.searchProblems(query, page, pageSize);
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
    currentPage,
    pageSize,
    isLoading: isLoadingProblems,
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
    updatePagination,
    refetchProblems,
    
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
