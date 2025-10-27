import React, { memo, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  onSort?: () => void;
  onFilter?: () => void;
}

const SearchBar = memo<SearchBarProps>(({ 
  onSearch, 
  placeholder = "Search questions",
  className,
  showClearButton = true,
  onSort,
  onFilter
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useAuthContext();

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
    <div className={cn("mb-4 flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pl-9 pr-10"
          aria-label="Search problems"
        />
        {showClearButton && query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onSort}
        aria-label="Sort problems"
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onFilter}
        aria-label="Filter problems"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
      
      <div className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{user?.solvedProblems || 0}/{user?.totalProblems || 3715} Solved</span>
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
