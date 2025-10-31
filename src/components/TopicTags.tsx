import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubTopics } from "@/hooks/useSubTopics";
import { useNavigate } from "react-router-dom";

const DEFAULT_VISIBLE = 10;

const TopicTags = () => {
  const { subTopics, isLoading } = useSubTopics();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (!subTopics) return [];
    return expanded ? subTopics : subTopics.slice(0, DEFAULT_VISIBLE);
  }, [subTopics, expanded]);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {isLoading && Array.from({ length: DEFAULT_VISIBLE }).map((_, i) => (
          <Badge key={i} variant="secondary" className="opacity-60">Loading...</Badge>
        ))}
        {!isLoading && visibleItems.map((item) => (
          <Badge
            key={item._id}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            title={item.description || item.sub_topic_name}
            onClick={() => navigate(`/problems/by-sub-topic/${item._id}?page=1&limit=20`)}
          >
            {item.sub_topic_name?.trim() || "Unnamed"}
          </Badge>
        ))}
      </div>
      {!isLoading && subTopics.length > DEFAULT_VISIBLE && (
        <div className="mt-2">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Thu gọn" : `Hiển thị thêm (${subTopics.length - DEFAULT_VISIBLE})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicTags;
