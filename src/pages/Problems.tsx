import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import BannerCards from "@/components/BannerCards";
import TopicTags from "@/components/TopicTags";
import FilterButtons from "@/components/FilterButtons";
import SearchBar from "@/components/SearchBar";
import ProblemList from "@/components/ProblemList";

const Problems = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-auto p-6">
          <BannerCards />
          <TopicTags />
          <FilterButtons />
          <SearchBar />
          <ProblemList />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Problems;
