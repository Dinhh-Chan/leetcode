import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useProblemsBySubTopic } from "@/hooks/useProblemsBySubTopic";
import { DIFFICULTY_COLORS } from "@/constants";
import { Check, Clock, Users } from "lucide-react";
import { useMemo, useEffect } from "react";

const DIFFICULTY_LABEL = (d: number): 'Dễ' | 'Trung bình' | 'Khó' => {
  if (d <= 2) return 'Dễ';
  if (d === 3) return 'Trung bình';
  return 'Khó';
};

const Toolbar = () => {
  const { q, updateParam } = useProblemsBySubTopic();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Input
        placeholder="Tìm kiếm bài tập..."
        className="w-64"
        defaultValue={q}
        onChange={(e) => {
          const value = e.currentTarget.value;
          // simple debounce via timeout per keystroke isn't ideal; acceptable lightweight
          const timer = (e.currentTarget as any)._t as number | undefined;
          if (timer) clearTimeout(timer);
          (e.currentTarget as any)._t = window.setTimeout(() => updateParam('q', value || undefined), 300);
        }}
      />
    </div>
  );
};

const ProgressCard = () => {
  const { progress } = useProblemsBySubTopic();
  return (
    <div className="rounded-lg border p-4 mb-4">
      <div className="text-sm text-muted-foreground">Progress</div>
      <div className="mt-2 flex items-center gap-4">
        <div className="text-2xl font-semibold">{progress.solvedCount}</div>
        <div className="text-sm">/ {progress.total} solved</div>
        <div className="ml-auto text-sm text-muted-foreground">{progress.percent}%</div>
      </div>
    </div>
  );
};

const ProblemsList = () => {
  const { data, isLoading, isFetching, pagination } = useProblemsBySubTopic();
  const location = useLocation();
  const items = data;
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
        Chưa có bài nào trong subtopic này.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card relative">
      {isBackgroundLoading && (
        <div className="absolute inset-0 z-10 rounded-lg bg-background/60 backdrop-blur-sm transition-opacity" />
      )}
      {items.map((p, idx) => {
        const label = DIFFICULTY_LABEL(p.difficulty);
        return (
          <div
            key={p._id}
            className={`flex items-center gap-4 p-3 transition-opacity ${idx !== items.length - 1 ? 'border-b' : ''} ${isBackgroundLoading ? 'opacity-60' : 'opacity-100'}`}
          >
            <div className="flex w-8 items-center justify-center">
              {p.is_done ? <Check className="h-4 w-4 text-green-600" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/problems/${p._id}`} className="cursor-pointer text-sm font-medium hover:text-primary truncate">
                  {p.name}
                </Link>
                {p.is_done && <span className="ml-2 text-[10px] font-medium text-green-600">✓ Đã giải</span>}
                <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[label]}`}>{label}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.time_limit_ms}ms</div>
                <div className="flex items-center gap-1"><Users className="h-3 w-3" />{p.memory_limit_mb}MB</div>
                <div>{p.number_of_tests || 0} tests</div>
              </div>
            </div>
            <div>
              <Link to={`/problems/${p._id}`} state={{ from: location.pathname + location.search }}>
                <Button size="sm" variant="outline" disabled={isBackgroundLoading}>Practice</Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PaginationBar = () => {
  const { pagination, updateParam, page, limit } = useProblemsBySubTopic();
  if (!pagination) return null;
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
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
        <Button variant="outline" size="sm" onClick={() => updateParam('page', String(page - 1))} disabled={page === 1}>Previous</Button>
        <span className="text-sm">Page {page} of {pagination.totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => updateParam('page', String(page + 1))} disabled={page === pagination.totalPages}>Next</Button>
      </div>
    </div>
  );
};

const ProblemsBySubTopic = () => {
  const { subTopicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, pagination } = useProblemsBySubTopic();

  useEffect(() => {
    if (!subTopicId) return;
    if (!location.pathname.includes('/without-testcases')) {
      navigate(`/problems/by-sub-topic/${subTopicId}/without-testcases${location.search || ''}`, { replace: true });
    }
  }, [subTopicId, location.pathname, location.search, navigate]);

  // Title uses subtopic name from first item if available
  const title = useMemo(() => {
    const first = data?.[0]?.sub_topic?.sub_topic_name || 'Subtopic';
    const total = pagination?.total || data.length || 0;
    return `${first} — ${total} problems`;
  }, [data, pagination]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="mb-2 text-2xl font-bold">{title}</h1>
          <Toolbar />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <ProgressCard />
            </div>
            <div className="lg:col-span-3">
              <ProblemsList />
              <PaginationBar />
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProblemsBySubTopic;











