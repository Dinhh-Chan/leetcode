import { useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { problemsService } from '@/services';
import { ProblemsListResponse } from '@/services/types/problems';
import { useAuthContext } from '@/contexts/AuthContext';

export const useProblemsByTopic = () => {
  const { topicId } = useParams();
  const [params, setParams] = useSearchParams();
  const { user } = useAuthContext();

  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 20);
  const difficulty = params.get('difficulty') || '';
  const sortParam = params.get('sort');
  const orderParam = params.get('order');
  const sort = sortParam || 'difficulty';
  const order = (orderParam || 'asc') as 'asc' | 'desc';

  // Auto filter is_public = true if user is STUDENT
  const isPublic = user?.systemRole === 'Student' ? true : undefined;

  const query = useQuery({
    queryKey: ['problems-by-topic', topicId, page, limit, difficulty, sort, order, isPublic],
    queryFn: () => problemsService.getProblemsByTopic(topicId as string, {
      page,
      limit,
      difficulty: difficulty || undefined,
      is_public: isPublic,
      sort: sort || undefined,
      order: order || undefined,
    }),
    enabled: !!topicId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === '' || value === null) next.delete(key);
    else next.set(key, value);
    // Reset to first page when filters change
    if (key !== 'page') next.set('page', '1');
    setParams(next, { replace: true });
  };

  const progress = useMemo(() => {
    const resp = query.data as unknown as ProblemsListResponse | undefined;
    const total = resp?.pagination?.total || resp?.data?.length || 0;
    const solvedItems = resp?.data?.filter((item) => item.is_done) ?? [];
    const solvedCount = solvedItems.length;
    const percent = total ? Math.round((solvedCount / total) * 100) : 0;
    return { solvedCount, total, percent };
  }, [query.data]);

  return {
    topicId,
    data: (query.data as any)?.data || [],
    pagination: (query.data as any)?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    // state
    page,
    limit,
    difficulty,
    sort,
    order,
    updateParam,
    progress,
  };
};

