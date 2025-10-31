import { useQuery } from '@tanstack/react-query';
import { judge0Service, Judge0Language } from '@/services/judge0';

export const useLanguages = () => {
  const { data, isLoading, error, refetch } = useQuery<Judge0Language[]>({
    queryKey: ['judge0', 'languages'],
    queryFn: () => judge0Service.getLanguages(),
    staleTime: 60 * 60 * 1000, // 1h
  });

  return {
    languages: data || [],
    isLoading,
    error,
    refetch,
  };
};


