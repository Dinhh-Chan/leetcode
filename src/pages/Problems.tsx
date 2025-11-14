import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import BannerCards from "@/components/BannerCards";
import TopicTags from "@/components/TopicTags";
import FilterButtons from "@/components/FilterButtons";
import SearchBar from "@/components/SearchBar";
import ProblemList from "@/components/ProblemList";
import { useProblems } from "@/hooks/useProblems";
import { useCallback } from "react";

const Problems = () => {
  const problemsState = useProblems();
  const { 
    setSearchQuery, 
    searchQuery, 
    updateFilterCondition, 
    updateSort,
    filterCondition,
    sort,
    order
  } = problemsState;

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((condition: any) => {
    updateFilterCondition(condition);
  }, [updateFilterCondition]);

  const handleSortChange = useCallback((newSort: string | null, newOrder: 'asc' | 'desc' | null) => {
    updateSort(newSort, newOrder);
  }, [updateSort]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-auto p-6">
          <BannerCards />
          <TopicTags />
          <FilterButtons />
          <SearchBar
            placeholder="Tìm kiếm bài tập"
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            initialQuery={searchQuery}
            initialFilter={filterCondition}
            initialSort={sort}
            initialOrder={order}
          />
          <ProblemList state={problemsState} />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Problems;
