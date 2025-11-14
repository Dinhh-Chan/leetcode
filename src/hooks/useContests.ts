import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestsService } from '@/services/contests';
import { OngoingContestsResponse } from '@/services/types/contests';
import { toast } from 'sonner';

export const useContests = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [contestType, setContestType] = useState('practice');

  // Get ongoing contests
  const {
    data: contestsData,
    isLoading: isLoadingContests,
    error: contestsError,
    refetch: refetchContests,
  } = useQuery({
    queryKey: ['contests', 'ongoing', currentPage, pageSize, contestType],
    queryFn: () => contestsService.getOngoingContests(currentPage, pageSize, contestType),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get my contests
  const {
    data: myContestsData,
    isLoading: isLoadingMyContests,
    error: myContestsError,
    refetch: refetchMyContests,
  } = useQuery({
    queryKey: ['contests', 'my'],
    queryFn: () => contestsService.getMyContests(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Join contest mutation
  const joinContestMutation = useMutation({
    mutationFn: (contestId: string) => contestsService.joinContest(contestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Đã tham gia cuộc thi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Tham gia cuộc thi thất bại');
    },
  });

  // Join contest function
  const joinContest = useCallback(
    async (contestId: string) => {
      return joinContestMutation.mutateAsync(contestId);
    },
    [joinContestMutation]
  );

  return {
    // State
    contests: contestsData?.data?.result || [],
    pagination: contestsData?.data ? {
      page: contestsData.data.page,
      limit: contestsData.data.limit,
      total: contestsData.data.total,
      totalPages: Math.ceil(contestsData.data.total / contestsData.data.limit),
    } : undefined,
    isLoadingContests,
    contestsError,
    
    // My contests - handle both { data: { result: [...] } } and { data: [...] } structures
    myContests: (() => {
      if (!myContestsData?.data) return [];
      // Check if data is array directly
      if (Array.isArray(myContestsData.data)) {
        return myContestsData.data;
      }
      // Check if data has result property
      if (Array.isArray(myContestsData.data.result)) {
        return myContestsData.data.result;
      }
      return [];
    })(),
    isLoadingMyContests,
    myContestsError,
    
    // Actions
    refetchContests,
    refetchMyContests,
    setCurrentPage,
    setPageSize,
    setContestType,
    joinContest,
    
    // Mutation states
    isJoining: joinContestMutation.isPending,
    
    // Errors
    joinError: joinContestMutation.error,
  };
};

