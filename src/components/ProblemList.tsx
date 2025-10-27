import React, { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, Star, Clock, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useProblems } from "@/hooks/useProblems";
import { useAuthContext } from "@/contexts/AuthContext";
import { Problem } from "@/types";
import { DIFFICULTY_COLORS, PROBLEM_STATUS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ProblemList = memo(() => {
  const { problems, isLoading, currentPage, pagination, updatePagination } = useProblems();
  const { isAuthenticated } = useAuthContext();
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'acceptance'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || "text-muted-foreground";
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

  const formatAcceptance = (acceptance: number) => {
    return `${acceptance.toFixed(1)}%`;
  };

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
        <h2 className="text-lg font-semibold">Problems</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('title')}
            className={cn(sortBy === 'title' && 'bg-muted')}
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('acceptance')}
            className={cn(sortBy === 'acceptance' && 'bg-muted')}
          >
            Acceptance {sortBy === 'acceptance' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('difficulty')}
            className={cn(sortBy === 'difficulty' && 'bg-muted')}
          >
            Difficulty {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {/* Problems list */}
      <div className="rounded-lg border bg-card">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No problems found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          problems.map((problem, index) => (
            <div
              key={problem.id}
              className={cn(
                "flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors",
                index !== problems.length - 1 && "border-b"
              )}
            >
              <div className="flex w-8 items-center justify-center">
                {isAuthenticated ? getStatusIcon(problem.status) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{problem.id}.</span>
                  <Link 
                    to={`/problems/${problem.id}`}
                    className="cursor-pointer text-sm font-medium hover:text-primary truncate"
                  >
                    {problem.title}
                  </Link>
                  {problem.isPremium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {problem.likes}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {problem.tags.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground w-16 text-center">
                {formatAcceptance(problem.acceptance)}
              </div>
              <div className={cn("w-16 text-sm font-medium text-center", getDifficultyColor(problem.difficulty))}>
                {problem.difficulty}
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
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePagination(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePagination(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

ProblemList.displayName = 'ProblemList';

export default ProblemList;
