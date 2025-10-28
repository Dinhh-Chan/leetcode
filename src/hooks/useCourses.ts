import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@/services/courses';

export const useCourses = () => {
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', 'active'],
    queryFn: () => coursesService.getActiveCourses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses,
    isLoading,
    error,
    refetch,
  };
};

