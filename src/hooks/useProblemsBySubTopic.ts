import { useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { problemsService } from '@/services';
import { ProblemsListResponse } from '@/services/types/problems';

export const useProblemsBySubTopic = () => {
  const { subTopicId } = useParams();
  const [params, setParams] = useSearchParams();

  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 20);
  const q = params.get('q') || '';
  const difficulty = ''; // deprecated filters
  const solved = ''; // deprecated filters
  const defaultSort = '{"difficulty":1}';

  const query = useQuery({
    queryKey: ['problems-by-subtopic', subTopicId, page, limit, q],
    queryFn: () => problemsService.getProblemsBySubTopic(subTopicId as string, {
      page,
      limit,
      q: q || undefined,
      sort: defaultSort,
      withTestcases: false,
    }),
    enabled: !!subTopicId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const solvedQuery = useQuery({
    queryKey: ['problems-by-subtopic-solved-count', subTopicId],
    queryFn: () => problemsService.getProblemsBySubTopic(subTopicId as string, {
      page: 1,
      limit: 200,
      solved: '1',
      withTestcases: false,
    }),
    enabled: !!subTopicId,
    staleTime: 5 * 60 * 1000,
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
    const solvedItems = (solvedQuery.data as ProblemsListResponse | undefined)?.data ?? [];
    const solvedCount = solvedItems.filter((item) => item.is_done && (!subTopicId || item.sub_topic_id === subTopicId)).length;
    const percent = total ? Math.round((solvedCount / total) * 100) : 0;
    return { solvedCount, total, percent };
  }, [query.data, solvedQuery.data, subTopicId]);

  return {
    subTopicId,
    data: (query.data as any)?.data || [],
    pagination: (query.data as any)?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    solvedProgressLoading: solvedQuery.isLoading || solvedQuery.isFetching,
    // state
    page,
    limit,
    q,
    difficulty,
    solved,
    sort: defaultSort,
    updateParam,
    progress,
  };
};


