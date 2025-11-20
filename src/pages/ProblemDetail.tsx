import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, List, Settings } from "lucide-react";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import { problemsService } from "@/services";
import { Problem as ApiProblem } from "@/services/types/problems";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AiAssistantPanel from "@/components/AiAssistantPanel";
import { useAuthContext } from "@/contexts/AuthContext";
import { submissionsService } from "@/services/submissions";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("description");
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [prevProblemId, setPrevProblemId] = useState<string | null>(null);
  const [nextProblemId, setNextProblemId] = useState<string | null>(null);
  const [isNeighborLoading, setIsNeighborLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await problemsService.getProblem(id as string);
        if (mounted) setProblem(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load problem");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const fetchNeighborProblems = async () => {
      if (!problem?._id) {
        if (!isCancelled) {
          setPrevProblemId(null);
          setNextProblemId(null);
        }
        return;
      }

      const subTopicId = problem.sub_topic_id || (problem as any)?.sub_topic?._id || (problem as any)?.sub_topic?.sub_topic_id;
      if (!subTopicId) {
        if (!isCancelled) {
          setPrevProblemId(null);
          setNextProblemId(null);
        }
        return;
      }

      const PAGE_SIZE = 50;
      let page = 1;
      let found = false;
      let previousPageLastId: string | null = null;
      let nextId: string | null = null;
      let prevId: string | null = null;

      try {
        setIsNeighborLoading(true);

        while (!found) {
          const response = await problemsService.getProblemsBySubTopic(subTopicId, { limit: PAGE_SIZE, page, withTestcases: false });
          const items = response?.data || [];

          if (!items.length) break;

          const currentIndex = items.findIndex((item) => item._id === problem._id);

          if (currentIndex !== -1) {
            prevId = currentIndex > 0 ? items[currentIndex - 1]._id : previousPageLastId;

            if (currentIndex < items.length - 1) {
              nextId = items[currentIndex + 1]._id;
            } else {
              if (items.length === PAGE_SIZE) {
                const nextPageResp = await problemsService.getProblemsBySubTopic(subTopicId, { limit: PAGE_SIZE, page: page + 1, withTestcases: false });
                const nextItems = nextPageResp?.data || [];
                nextId = nextItems.length ? nextItems[0]._id : null;
              } else {
                nextId = null;
              }
            }

            found = true;
          } else {
            previousPageLastId = items[items.length - 1]?._id || previousPageLastId;

            if (items.length < PAGE_SIZE) break;
            page += 1;
          }

          if (isCancelled) {
            return;
          }
        }

        if (!isCancelled) {
          setPrevProblemId(prevId || null);
          setNextProblemId(nextId || null);
        }
      } catch (err) {
        if (!isCancelled) {
          setPrevProblemId(null);
          setNextProblemId(null);
        }
      } finally {
        if (!isCancelled) {
          setIsNeighborLoading(false);
        }
      }
    };

    fetchNeighborProblems();

    return () => {
      isCancelled = true;
    };
  }, [problem]);

  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      if (!id || !user?._id) {
        setSubmissions([]);
        return;
      }
      try {
        setIsLoadingSubmissions(true);
        setSubmissionError(null);
        const res = await submissionsService.getProblemSubmissions(id);
        const list = (res.data || []).filter((item) => {
          const studentId = item.student_id || item.student?._id;
          return !user?._id || studentId === user._id;
        });
        if (mounted) {
          setSubmissions(list);
        }
      } catch (err: any) {
        if (mounted) {
          setSubmissionError(err?.message || "Không thể tải danh sách bài nộp");
        }
      } finally {
        if (mounted) {
          setIsLoadingSubmissions(false);
        }
      }
    };
    loadSubmissions();
    return () => {
      mounted = false;
    };
  }, [id, user?._id]);

  const getStatusInfo = (status?: string | null) => {
    const normalized = status?.toLowerCase() || "";
    if (normalized === "accepted") {
      return { label: "Đã chấp nhận", badgeClass: "bg-emerald-100 text-emerald-700", cardClass: "border-l-4 border-emerald-300" };
    }
    if (normalized === "wrong answer") {
      return { label: "Sai đáp án", badgeClass: "bg-red-100 text-red-700", cardClass: "border-l-4 border-red-300" };
    }
    if (normalized === "time limit exceeded") {
      return { label: "Quá thời gian", badgeClass: "bg-orange-100 text-orange-700", cardClass: "border-l-4 border-orange-300" };
    }
    if (normalized === "runtime error") {
      return { label: "Lỗi khi chạy", badgeClass: "bg-rose-100 text-rose-700", cardClass: "border-l-4 border-rose-300" };
    }
    if (normalized === "pending" || normalized === "waiting") {
      return { label: "Đang chấm", badgeClass: "bg-slate-200 text-slate-700", cardClass: "border-l-4 border-slate-300" };
    }
    return { label: status || "Không xác định", badgeClass: "bg-muted text-muted-foreground", cardClass: "border-l-4 border-border" };
  };

  const handleNavigateProblem = (targetId: string | null | undefined) => {
    if (!targetId || targetId === problem?._id) return;
    navigate(`/problems/${targetId}`);
  };

  const mapDifficulty = (d: number): "Dễ" | "Trung bình" | "Khó" => {
    if (d <= 2) return "Dễ";
    if (d === 3) return "Trung bình";
    return "Khó";
  };

  const problemData = useMemo(() => {
    if (!problem) return null;
    return {
      id: 1,
      title: problem.name,
      difficulty: mapDifficulty(problem.difficulty),
      description: problem.description,
      guidelines: problem.guidelines,
      solution: problem.solution,
      constraints: [] as string[],
      followUp: undefined,
      topics: problem.topic?.topic_name ? [problem.topic.topic_name] : [] as string[],
      companies: [] as string[],
      likes: 0,
      dislikes: 0,
      comments: 0,
      views: 0,
      solved: (problem as any).is_done || false,
    } as const;
  }, [problem]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/problems")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/problems")}
          >
            <List className="h-4 w-4" />
            Problem List
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleNavigateProblem(prevProblemId)}
            disabled={!prevProblemId || isNeighborLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleNavigateProblem(nextProblemId)}
            disabled={!nextProblemId || isNeighborLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={45} minSize={25} maxSize={70} className="border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
              <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent px-4">
                <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Description
                </TabsTrigger>
                <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="m-0 flex-1 overflow-hidden p-4">
                {isLoading && (
                  <div className="p-6 text-sm text-muted-foreground">Loading...</div>
                )}
                {error && (
                  <div className="p-6 text-sm text-destructive">{error}</div>
                )}
                {problemData && <ProblemDescription problemData={problemData} />}
              </TabsContent>

              <TabsContent value="submissions" className="m-0 flex-1 overflow-auto scrollbar-custom p-6">
                {isLoadingSubmissions ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải danh sách bài nộp...
                    </div>
                  </div>
                ) : submissionError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {submissionError}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Chưa có bài nộp nào cho bài toán này. Hãy viết mã và nộp để xem kết quả tại đây.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => {
                      const statusInfo = getStatusInfo(submission.status);
                      return (
                        <div
                          key={submission._id || submission.submission_id}
                          className={`rounded-lg border bg-card p-4 shadow-sm ${statusInfo.cardClass}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                              <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
                              <div className="text-xs text-muted-foreground">
                                Nộp lúc: {new Date(submission.submitted_at || submission.createdAt).toLocaleString("vi-VN")}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-xs text-muted-foreground">
                                {submission.execution_time_ms ?? "--"} ms • {submission.memory_used_mb ?? "--"} MB
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Đã qua {submission.test_cases_passed}/{submission.total_test_cases} test
                              </div>
                              <Link to={`/submissions/${submission._id || submission.submission_id}`}>
                                <Button variant="outline" size="sm">
                                  Xem chi tiết
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border" />
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60} className="border-r">
            <CodeEditor
              initialCode={problem?.code_template || ''}
              language="python"
              testCases={(problem?.test_cases || []).map((tc: any) => ({
                input: tc.input_data || '',
                output: tc.expected_output || '',
              }))}
              problemId={problem?._id}
              studentId={user?._id}
              onCodeChange={setUserCode}
            />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border" />
          <ResizablePanel defaultSize={20} minSize={15}>
            <AiAssistantPanel
              problemDescription={problem?.description || ''}
              exampleCode={problem?.solution || problem?.code_template || ''}
              userCode={userCode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ProblemDetail;
