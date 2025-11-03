import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, List, Settings } from "lucide-react";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import { problemsService } from "@/services";
import { contestsService } from "@/services";
import { Problem as ApiProblem } from "@/services/types/problems";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useAuthContext } from "@/contexts/AuthContext";
import { contestSubmissionsService } from "@/services/contestSubmissions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, HardDrive } from "lucide-react";
import { toast } from "sonner";

const ContestProblemDetail = () => {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("description");
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Guard: chặn truy cập nếu cuộc thi đã kết thúc
  useEffect(() => {
    const checkContestEnded = async () => {
      if (!contestId) return;
      try {
        const c = await contestsService.getContest(contestId);
        const ended = new Date(c.end_time).getTime() <= Date.now();
        if (ended) {
          toast.error('Cuộc thi đã kết thúc. Bạn không thể truy cập bài nữa.');
          navigate(`/contest/${contestId}`);
        }
      } catch {
        // ignore
      }
    };
    checkContestEnded();
  }, [contestId, navigate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await problemsService.getProblem(problemId as string);
        if (mounted) setProblem(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không thể tải đề bài");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (problemId) load();
    return () => {
      mounted = false;
    };
  }, [problemId]);

  const loadSubmissions = useCallback(async () => {
    if (!contestId || !problemId) return;
    try {
      setIsLoadingSubmissions(true);
      const response = await contestSubmissionsService.getSubmissionsByContestAndProblem(contestId, problemId);
      setSubmissions(response.data || []);
    } catch (e: any) {
      console.error("Error loading submissions:", e);
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [contestId, problemId]);

  useEffect(() => {
    if (activeTab === "submissions") {
      loadSubmissions();
    }
  }, [activeTab, loadSubmissions]);

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
            onClick={() => navigate(`/contest/${contestId}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(`/contest/${contestId}`)}
          >
            <List className="h-4 w-4" />
            Danh sách bài
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
                  Mô tả
                </TabsTrigger>
                <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="m-0 flex-1 overflow-hidden p-4">
                {isLoading && (
                  <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>
                )}
                {error && (
                  <div className="p-6 text-sm text-destructive">{error}</div>
                )}
                {problemData && <ProblemDescription problemData={problemData} />}
              </TabsContent>

              <TabsContent value="submissions" className="m-0 flex-1 overflow-auto p-6">
                {isLoadingSubmissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Chưa có bài nộp nào.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => {
                      const getStatusColor = (status: string) => {
                        const lowerStatus = status.toLowerCase();
                        if (lowerStatus.includes('accepted')) return "text-green-600";
                        if (lowerStatus.includes('wrong')) return "text-destructive";
                        if (lowerStatus.includes('error')) return "text-destructive";
                        if (lowerStatus.includes('timeout')) return "text-orange-600";
                        return "text-muted-foreground";
                      };

                      const getStatusText = (status: string) => {
                        const lowerStatus = status.toLowerCase();
                        if (lowerStatus.includes('accepted')) return "ACCEPTED";
                        if (lowerStatus.includes('wrong')) return "WRONG ANSWER";
                        if (lowerStatus.includes('error')) return "ERROR";
                        if (lowerStatus.includes('timeout')) return "TIME LIMIT EXCEEDED";
                        return status.toUpperCase();
                      };

                      return (
                        <Card 
                          key={submission._id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/contest/${contestId}/submissions/${submission._id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`font-semibold ${getStatusColor(submission.status)}`}>
                                  {getStatusText(submission.status)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {submission.test_cases_passed} / {submission.total_test_cases} test cases
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {submission.execution_time_ms} ms
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <HardDrive className="h-3 w-3" />
                                  {submission.memory_used_mb} MB
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {submission.score} điểm
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(submission.submitted_at).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border" />
          <ResizablePanel defaultSize={55} minSize={30} maxSize={75}>
            <CodeEditor
              initialCode={''}
              language="python"
              testCases={(problem?.test_cases || []).map((tc: any) => ({
                input: tc.input_data || '',
                output: tc.expected_output || '',
              }))}
              problemId={problem?._id}
              contestId={contestId}
              isContestSubmission={true}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ContestProblemDetail;

