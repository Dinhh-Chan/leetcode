import React, { memo, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, Star, Clock, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useProblems } from "@/hooks/useProblems";
import { useAuthContext } from "@/contexts/AuthContext";
import { Problem } from "@/services/types/problems";
import { DIFFICULTY_COLORS, PROBLEM_STATUS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ProblemList = memo(() => {
  const { problems, isLoading, currentPage, pagination, updatePagination } = useProblems();
  const { isAuthenticated } = useAuthContext();
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'acceptance'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getDifficultyLabel = (difficulty: number): 'Easy' | 'Medium' | 'Hard' => {
    if (difficulty === 1) return 'Easy';
    if (difficulty === 2) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty: number) => {
    const label = getDifficultyLabel(difficulty);
    return DIFFICULTY_COLORS[label] || "text-muted-foreground";
  };

  const getStatusIcon = (status: string | null | undefined) => {
    if (status === PROBLEM_STATUS.SOLVED) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (status === PROBLEM_STATUS.ATTEMPTED) {
      return <Circle className="h-4 w-4 text-yellow-600" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground/30" />;
  };

  // Transform problems to include display properties
  type DisplayProblem = Problem & {
    id: number;
    title: string;
    difficultyLabel: 'Easy' | 'Medium' | 'Hard';
    tags: string[];
    status?: string | null;
  };

  const displayProblems = useMemo<DisplayProblem[]>(() => {
    if (!problems || !Array.isArray(problems)) return [];
    return problems.map((problem, index): DisplayProblem => {
      const { name, difficulty, topic, sub_topic, ...rest } = problem;
      return {
        ...rest,
        id: index + 1 + ((currentPage - 1) * (pagination?.limit || 20)),
        title: name,
        difficultyLabel: getDifficultyLabel(difficulty),
        tags: [topic?.topic_name, sub_topic?.sub_topic_name].filter(Boolean) as string[],
        status: problem.is_done ? PROBLEM_STATUS.SOLVED : null,
        name,
        difficulty,
        topic,
        sub_topic,
      };
    });
  }, [problems, currentPage, pagination]);

  const handleSort = (field: 'title' | 'difficulty' | 'acceptance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sorting */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bài tập</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('title')}
            className={cn(sortBy === 'title' && 'bg-muted')}
          >
            Tiêu đề {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('acceptance')}
            className={cn(sortBy === 'acceptance' && 'bg-muted')}
          >
            Tỷ lệ đúng {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('difficulty')}
            className={cn(sortBy === 'difficulty' && 'bg-muted')}
          >
            Độ khó {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {/* Problems list */}
      <div className="rounded-lg border bg-card">
        {displayProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy bài tập</h3>
            <p className="text-muted-foreground text-center">
              Hãy thử điều chỉnh bộ lọc hoặc tiêu chí tìm kiếm
            </p>
          </div>
        ) : (
          displayProblems.map((problem, index) => (
            <div
              key={problem._id}
              className={cn(
                "flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors",
                index !== displayProblems.length - 1 && "border-b"
              )}
            >
              <div className="flex w-8 items-center justify-center">
                {isAuthenticated ? getStatusIcon(problem.status) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{problem.id}.</span>
                  <Link 
                    to={`/problems/${problem._id}`}
                    className="cursor-pointer text-sm font-medium hover:text-primary truncate"
                  >
                    {problem.title}
                  </Link>
                  {problem.is_done && (
                    <span className="ml-2 text-[10px] font-medium text-green-600">✓ Đã giải</span>
                  )}
                  {!problem.is_public && (
                    <Badge variant="secondary" className="text-xs">Riêng tư</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  {problem.topic?.topic_name && (
                    <Badge variant="outline" className="text-xs">
                      {problem.topic.topic_name}
                    </Badge>
                  )}
                  {problem.sub_topic?.sub_topic_name && (
                    <Badge variant="outline" className="text-xs">
                      {problem.sub_topic.sub_topic_name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {problem.time_limit_ms}ms
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {problem.memory_limit_mb}MB
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground w-16 text-center">
                {problem.number_of_tests || 0} test
              </div>
              <div className={cn("w-20 text-sm font-medium text-center", getDifficultyColor(problem.difficulty))}>
                {problem.difficultyLabel}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {/* Handle like */}}
                >
                  <Star className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {((currentPage - 1) * pagination.limit) + 1} đến {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total} kết quả
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePagination(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {currentPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePagination(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

ProblemList.displayName = 'ProblemList';

export default ProblemList;
