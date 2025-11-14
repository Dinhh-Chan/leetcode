import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { topicsService } from "@/services";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FilterButtons = () => {
  const navigate = useNavigate();
  const { data: topics, isLoading, isError } = useQuery({
    queryKey: ["topics", "many"],
    queryFn: () => topicsService.getMany(),
    staleTime: 5 * 60 * 1000,
  });

  const buttons = useMemo(() => {
    const base = [{ label: "Tất cả chủ đề", active: true, topicId: null }];
    if (!topics?.length) return base;
    return base.concat(
      topics.map((topic) => ({
        label: topic.topic_name,
        active: false,
        topicId: topic._id,
      }))
    );
  }, [topics]);

  const handleTopicClick = (topicId: string | null) => {
    if (topicId) {
      navigate(`/problems/by-topic/${topicId}?page=1&limit=20`);
    } else {
      navigate('/problems');
    }
  };

  if (isLoading) {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {buttons.map((filter) => (
        <Button
          key={filter.label}
          variant={filter.active ? "default" : "outline"}
          size="sm"
          className={filter.active ? "bg-foreground text-background hover:bg-foreground/90" : "cursor-pointer"}
          onClick={() => handleTopicClick(filter.topicId)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterButtons;
