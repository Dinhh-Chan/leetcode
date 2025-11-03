import { useQuery } from '@tanstack/react-query';
import { subTopicsService } from '@/services';
import { SubTopicItem } from '@/services/types/subtopics';

export const useSubTopics = () => {
  const { data, isLoading, error, refetch } = useQuery<SubTopicItem[]>({
    queryKey: ['sub-topics', 'many'],
    queryFn: () => subTopicsService.getMany(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    subTopics: data || [],
    isLoading,
    error,
    refetch,
  };
};













