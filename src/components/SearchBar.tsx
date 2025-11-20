import React, { memo, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import FilterDialog, { FilterCondition } from './FilterDialog';
import SortDialog from './SortDialog';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  onFilterChange?: (condition: FilterCondition | null) => void;
  onSortChange?: (sort: string | null, order: 'asc' | 'desc' | null) => void;
  initialQuery?: string;
  initialFilter?: FilterCondition | null;
  initialSort?: string | null;
  initialOrder?: 'asc' | 'desc' | null;
}

const SearchBar = memo<SearchBarProps>(({ 
  onSearch, 
  placeholder = "Tìm kiếm bài tập",
  className,
  showClearButton = true,
  onFilterChange,
  onSortChange,
  initialQuery = '',
  initialFilter,
  initialSort,
  initialOrder,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  React.useEffect(() => {
    onSearch?.(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  return (
    <>
      <div className={cn("mb-4 flex items-center gap-2", className)}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pl-9 pr-10"
            aria-label="Tìm kiếm bài tập"
          />
          {showClearButton && query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
              onClick={handleClear}
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setSortOpen(true)}
          aria-label="Sắp xếp bài tập"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setFilterOpen(true)}
          aria-label="Lọc bài tập"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={onFilterChange || (() => {})}
        initialCondition={initialFilter}
      />

      <SortDialog
        open={sortOpen}
        onOpenChange={setSortOpen}
        onApply={onSortChange || (() => {})}
        initialSort={initialSort}
        initialOrder={initialOrder}
      />
    </>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
