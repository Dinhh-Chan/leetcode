import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { topicsService, subTopicsService } from "@/services";
import { useAuthContext } from "@/contexts/AuthContext";

export interface FilterCondition {
  topic_id?: string | { $in: string[] };
  sub_topic_id?: string | { $in: string[] };
  difficulty?: number | { $gte?: number; $lte?: number };
  is_public?: boolean;
  name?: { $regex?: string };
  $or?: Array<Record<string, any>>;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (condition: FilterCondition | null) => void;
  initialCondition?: FilterCondition | null;
}

const FilterDialog = ({ open, onOpenChange, onApply, initialCondition }: FilterDialogProps) => {
  const { user } = useAuthContext();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficultyMin, setDifficultyMin] = useState<string>("");
  const [difficultyMax, setDifficultyMax] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [nameSearch, setNameSearch] = useState<string>("");

  const { data: topics } = useQuery({
    queryKey: ["topics", "many"],
    queryFn: () => topicsService.getMany(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subTopics } = useQuery({
    queryKey: ["sub-topics", "many"],
    queryFn: () => subTopicsService.getMany(),
    staleTime: 5 * 60 * 1000,
  });

  // Initialize from initialCondition
  useEffect(() => {
    if (initialCondition) {
      if (initialCondition.topic_id) {
        if (typeof initialCondition.topic_id === 'string') {
          setSelectedTopics([initialCondition.topic_id]);
        } else if (initialCondition.topic_id.$in) {
          setSelectedTopics(initialCondition.topic_id.$in);
        }
      }
      if (initialCondition.sub_topic_id) {
        if (typeof initialCondition.sub_topic_id === 'string') {
          setSelectedSubTopics([initialCondition.sub_topic_id]);
        } else if (initialCondition.sub_topic_id.$in) {
          setSelectedSubTopics(initialCondition.sub_topic_id.$in);
        }
      }
      if (initialCondition.difficulty) {
        if (typeof initialCondition.difficulty === 'number') {
          setDifficultyMin(String(initialCondition.difficulty));
          setDifficultyMax(String(initialCondition.difficulty));
        } else {
          if (initialCondition.difficulty.$gte !== undefined) {
            setDifficultyMin(String(initialCondition.difficulty.$gte));
          }
          if (initialCondition.difficulty.$lte !== undefined) {
            setDifficultyMax(String(initialCondition.difficulty.$lte));
          }
        }
      }
      if (initialCondition.is_public !== undefined) {
        setIsPublic(initialCondition.is_public);
      }
      if (initialCondition.name?.$regex) {
        setNameSearch(initialCondition.name.$regex);
      }
    } else {
      // Auto set is_public = true for STUDENT
      if (user?.systemRole === 'Student') {
        setIsPublic(true);
      }
    }
  }, [initialCondition, user]);

  const handleApply = () => {
    const condition: FilterCondition = {};

    // Topic filter
    if (selectedTopics.length > 0) {
      condition.topic_id = selectedTopics.length === 1 ? selectedTopics[0] : { $in: selectedTopics };
    }

    // Sub-topic filter
    if (selectedSubTopics.length > 0) {
      condition.sub_topic_id = selectedSubTopics.length === 1 ? selectedSubTopics[0] : { $in: selectedSubTopics };
    }

    // Difficulty filter
    const min = difficultyMin ? Number(difficultyMin) : undefined;
    const max = difficultyMax ? Number(difficultyMax) : undefined;
    if (min !== undefined || max !== undefined) {
      if (min !== undefined && max !== undefined && min === max) {
        condition.difficulty = min;
      } else {
        condition.difficulty = {};
        if (min !== undefined) condition.difficulty.$gte = min;
        if (max !== undefined) condition.difficulty.$lte = max;
      }
    }

    // is_public filter
    if (isPublic !== null) {
      condition.is_public = isPublic;
    }

    // Name search (regex)
    if (nameSearch.trim()) {
      condition.name = { $regex: nameSearch.trim() };
    }

    // If no filters, return null
    const hasFilters = Object.keys(condition).length > 0;
    onApply(hasFilters ? condition : null);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedTopics([]);
    setSelectedSubTopics([]);
    setDifficultyMin("");
    setDifficultyMax("");
    setIsPublic(user?.systemRole === 'Student' ? true : null);
    setNameSearch("");
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleSubTopic = (subTopicId: string) => {
    setSelectedSubTopics(prev =>
      prev.includes(subTopicId) ? prev.filter(id => id !== subTopicId) : [...prev, subTopicId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lọc bài tập</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Topic Filter */}
          <div className="space-y-2">
            <Label>Chủ đề</Label>
            <div className="flex flex-wrap gap-2">
              {topics?.map((topic) => (
                <Badge
                  key={topic._id}
                  variant={selectedTopics.includes(topic._id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTopic(topic._id)}
                >
                  {topic.topic_name}
                  {selectedTopics.includes(topic._id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sub-topic Filter */}
          <div className="space-y-2">
            <Label>Chủ đề con</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {subTopics?.map((subTopic) => (
                <Badge
                  key={subTopic._id}
                  variant={selectedSubTopics.includes(subTopic._id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSubTopic(subTopic._id)}
                >
                  {subTopic.sub_topic_name}
                  {selectedSubTopics.includes(subTopic._id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <Label>Độ khó</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Từ"
                min="1"
                max="5"
                value={difficultyMin}
                onChange={(e) => setDifficultyMin(e.target.value)}
                className="w-24"
              />
              <span>đến</span>
              <Input
                type="number"
                placeholder="Đến"
                min="1"
                max="5"
                value={difficultyMax}
                onChange={(e) => setDifficultyMax(e.target.value)}
                className="w-24"
              />
            </div>
            <p className="text-xs text-muted-foreground">1 = Dễ, 2-3 = Trung bình, 4-5 = Khó</p>
          </div>

          {/* Name Search */}
          <div className="space-y-2">
            <Label>Tìm kiếm theo tên</Label>
            <Input
              placeholder="Nhập từ khóa..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Tìm kiếm không phân biệt hoa thường</p>
          </div>

          {/* is_public Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={isPublic === true}
              onCheckedChange={(checked) => setIsPublic(checked ? true : null)}
            />
            <Label htmlFor="is_public" className="cursor-pointer">
              Chỉ hiển thị bài tập công khai
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button onClick={handleApply}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;

