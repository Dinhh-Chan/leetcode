import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { problemsService } from "@/services/problems";
import { subTopicsService } from "@/services/subTopics";
import type { Problem, ProblemsListResponse } from "@/services/types/problems";
import type { SubTopicItem } from "@/services/types/subtopics";
import { useProblemsByTopic } from "@/hooks/useProblemsByTopic";
import { DIFFICULTY_COLORS } from "@/constants";
import { Check, Clock, Users } from "lucide-react";

const SUBTOPIC_PAGE_SIZE = 20;

const DIFFICULTY_LABEL = (d: number): 'Dễ' | 'Trung bình' | 'Khó' => {
  if (d <= 2) return 'Dễ';
  if (d === 3) return 'Trung bình';
  return 'Khó';
};

const ProgressCard = () => {
  const { progress } = useProblemsByTopic();
  return (
    <div className="rounded-lg border p-4 mb-4">
      <div className="text-sm text-muted-foreground">Tiến độ</div>
      <div className="mt-2 flex items-center gap-4">
        <div className="text-2xl font-semibold">{progress.solvedCount}</div>
        <div className="text-sm">/ {progress.total} đã giải</div>
        <div className="ml-auto text-sm text-muted-foreground">{progress.percent}%</div>
      </div>
    </div>
  );
};

const ProblemRows = ({
  items,
  isLoading,
  isFetching,
  emptyMessage,
}: {
  items: Problem[];
  isLoading: boolean;
  isFetching: boolean;
  emptyMessage?: string;
}) => {
  const location = useLocation();
  const isBackgroundLoading = isFetching && !isLoading;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
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

  if (!items?.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {emptyMessage || "Chưa có bài nào."}
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border bg-card">
      {isBackgroundLoading && (
        <div className="absolute inset-0 z-10 rounded-lg bg-background/60 backdrop-blur-sm transition-opacity" />
      )}
      {items.map((p, idx) => {
        const label = DIFFICULTY_LABEL(p.difficulty);
        return (
          <div
            key={p._id}
            className={`flex items-center gap-4 p-3 transition-opacity ${idx !== items.length - 1 ? "border-b" : ""} ${
              isBackgroundLoading ? "opacity-60" : "opacity-100"
            }`}
          >
            <div className="flex w-8 items-center justify-center">
              {p.is_done ? <Check className="h-4 w-4 text-green-600" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/problems/${p._id}`}
                  className="cursor-pointer truncate text-sm font-medium hover:text-primary"
                >
                  {p.name}
                </Link>
                {p.is_done && <span className="ml-2 text-[10px] font-medium text-green-600">✓ Đã giải</span>}
                <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[label]}`}>
                  {label}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {p.time_limit_ms}ms
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {p.memory_limit_mb}MB
                </div>
                <div>{p.number_of_tests || 0} bài test</div>
              </div>
            </div>
            <div>
              <Link to={`/problems/${p._id}`} state={{ from: location.pathname + location.search }}>
                <Button size="sm" variant="outline" disabled={isBackgroundLoading}>
                  Luyện tập
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProblemsList = () => {
  const { data, isLoading, isFetching } = useProblemsByTopic();
  return (
    <ProblemRows
      items={data}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyMessage="Chưa có bài nào trong topic này."
    />
  );
};

const PaginationBar = () => {
  const { pagination, updateParam, page, limit } = useProblemsByTopic();
  if (!pagination) return null;
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {((page - 1) * pagination.limit) + 1} đến {Math.min(page * pagination.limit, pagination.total)} trong tổng số {pagination.total} kết quả
      </p>
      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={String(limit)}
          onChange={(e) => updateParam('limit', e.target.value)}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => updateParam('page', String(page - 1))} disabled={page === 1}>Trước</Button>
        <span className="text-sm">Trang {page} / {pagination.totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => updateParam('page', String(page + 1))} disabled={page === pagination.totalPages}>Sau</Button>
      </div>
    </div>
  );
};

const SubTopicPagination = ({
  pagination,
  page,
  onPageChange,
}: {
  pagination?: { total: number; totalPages: number; limit: number };
  page: number;
  onPageChange: (page: number) => void;
}) => {
  if (!pagination) return null;
  const start = (page - 1) * pagination.limit + 1;
  const end = Math.min(page * pagination.limit, pagination.total);
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {pagination.total === 0 ? 0 : start} đến {end} trong tổng số {pagination.total} kết quả
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          Trước
        </Button>
        <span className="text-sm">
          Trang {page} / {pagination.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pagination.totalPages || pagination.total === 0}
        >
          Sau
        </Button>
      </div>
    </div>
  );
};

const SubTopicFilter = ({
  subTopics,
  isLoading,
  selectedSubTopic,
  onSelect,
}: {
  subTopics?: SubTopicItem[];
  isLoading: boolean;
  selectedSubTopic: SubTopicItem | null;
  onSelect: (subTopic: SubTopicItem | null) => void;
}) => {
  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-6 w-40" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!subTopics?.length) return null;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chủ đề nhỏ</h2>
        {selectedSubTopic && (
          <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Hiển thị tất cả
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedSubTopic ? "outline" : "default"}
          onClick={() => onSelect(null)}
        >
          Tất cả
        </Button>
        {subTopics.map((subTopic) => (
          <Button
            key={subTopic._id}
            size="sm"
            variant={selectedSubTopic?._id === subTopic._id ? "default" : "outline"}
            onClick={() =>
              onSelect(selectedSubTopic?._id === subTopic._id ? null : subTopic)
            }
          >
            {subTopic.sub_topic_name}
          </Button>
        ))}
      </div>
    </div>
  );
};

const ProblemsByTopic = () => {
  const { topicId } = useParams();
  const { data, pagination } = useProblemsByTopic();
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopicItem | null>(null);
  const [subTopicPage, setSubTopicPage] = useState(1);

  const { data: subTopics, isLoading: subTopicsLoading } = useQuery({
    queryKey: ["subtopics", topicId],
    queryFn: async () => {
      const list = await subTopicsService.getMany();
      return list.filter((item) => item.topic_id === topicId);
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
  });

  const selectedSubTopicId = selectedSubTopic?._id;

  const subTopicProblemsQuery = useQuery<ProblemsListResponse>({
    queryKey: ["problems-sub-topic", selectedSubTopicId, subTopicPage],
    queryFn: () =>
      problemsService.getProblemsBySubTopic(selectedSubTopicId as string, {
        page: subTopicPage,
        limit: SUBTOPIC_PAGE_SIZE,
      }),
    enabled: !!selectedSubTopicId,
    placeholderData: (prev) => prev,
  });

  const handleSelectSubTopic = (subTopic: SubTopicItem | null) => {
    setSelectedSubTopic(subTopic);
    setSubTopicPage(1);
  };

  const showingSubTopic = Boolean(selectedSubTopic);

  // Title uses topic name from first item if available
  const title = useMemo(() => {
    const first = data?.[0]?.topic?.topic_name || data?.[0]?.topic?.name || 'Topic';
    const total = pagination?.total || data.length || 0;
    return `${first} — ${total} bài tập`;
  }, [data, pagination]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="mb-2 text-2xl font-bold">{title}</h1>
          <SubTopicFilter
            subTopics={subTopics}
            isLoading={subTopicsLoading}
            selectedSubTopic={selectedSubTopic}
            onSelect={handleSelectSubTopic}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <ProgressCard />
            </div>
            <div className="lg:col-span-3">
              {showingSubTopic ? (
                <>
                  <div className="mb-3 rounded-lg border bg-muted/40 p-4 text-sm">
                    <p className="font-medium">
                      Đang xem sub-topic: {selectedSubTopic?.sub_topic_name}
                    </p>
                    <p className="text-muted-foreground">
                      Hiển thị tối đa {SUBTOPIC_PAGE_SIZE} bài tập mỗi trang.
                    </p>
                  </div>
                  <ProblemRows
                    items={subTopicProblemsQuery.data?.data || []}
                    isLoading={subTopicProblemsQuery.isLoading}
                    isFetching={subTopicProblemsQuery.isFetching}
                    emptyMessage="Chưa có bài nào trong sub-topic này."
                  />
                  <SubTopicPagination
                    pagination={subTopicProblemsQuery.data?.pagination}
                    page={subTopicPage}
                    onPageChange={setSubTopicPage}
                  />
                </>
              ) : (
                <>
                  <ProblemsList />
                  <PaginationBar />
                </>
              )}
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProblemsByTopic;

