import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, List, Settings, Clock, HardDrive, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import { problemsService } from "@/services";
import { coursesService } from "@/services/courses";
import { submissionsService, SubmitResponse } from "@/services/submissions";
import { Problem as ApiProblem } from "@/services/types/problems";
import { Course, CourseProblem } from "@/services/types/courses";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AiAssistantPanel from "@/components/AiAssistantPanel";
import { useAuthContext } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const CourseProblemDetail = () => {
  const { id, problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("description");
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [prevProblemId, setPrevProblemId] = useState<string | null>(null);
  const [nextProblemId, setNextProblemId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmitResponse['data'][]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Load course data to get problems list for navigation
  useEffect(() => {
    let mounted = true;
    const loadCourse = async () => {
      if (!id) return;
      try {
        setIsLoadingCourse(true);
        const courseData = await coursesService.getCourse(id);
        if (mounted) setCourse(courseData);
      } catch (e: any) {
        // Silently fail, we can still show the problem
        console.error("Failed to load course:", e);
      } finally {
        if (mounted) setIsLoadingCourse(false);
      }
    };
    loadCourse();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Load problem data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        if (!id || !problemId) {
          if (mounted) setError("Thiếu thông tin course hoặc problem");
          return;
        }
        const data = await problemsService.getCourseProblem(id, problemId);
        if (mounted) setProblem(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không thể tải đề bài");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (id && problemId) load();
    return () => {
      mounted = false;
    };
  }, [id, problemId]);

  // Calculate prev/next problem IDs based on course problems
  useEffect(() => {
    if (!course?.problems || !problemId) {
      setPrevProblemId(null);
      setNextProblemId(null);
      return;
    }

    const sortedProblems = course.problems
      .filter((p) => p.is_visible)
      .sort((a, b) => a.order_index - b.order_index);

    const currentIndex = sortedProblems.findIndex(
      (p) => p.problem_id === problemId
    );

    if (currentIndex === -1) {
      setPrevProblemId(null);
      setNextProblemId(null);
      return;
    }

    setPrevProblemId(
      currentIndex > 0
        ? sortedProblems[currentIndex - 1].problem_id
        : null
    );
    setNextProblemId(
      currentIndex < sortedProblems.length - 1
        ? sortedProblems[currentIndex + 1].problem_id
        : null
    );
  }, [course, problemId]);

  // Load submissions when problemId changes
  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      if (!problemId) return;
      try {
        setIsLoadingSubmissions(true);
        const response = await submissionsService.getProblemSubmissions(problemId);
        if (mounted) setSubmissions(response.data || []);
      } catch (e: any) {
        console.error("Failed to load submissions:", e);
        if (mounted) setSubmissions([]);
      } finally {
        if (mounted) setIsLoadingSubmissions(false);
      }
    };
    loadSubmissions();
    return () => {
      mounted = false;
    };
  }, [problemId]);

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('accepted')) return "text-green-600 dark:text-green-400";
    if (lowerStatus.includes('wrong')) return "text-red-600 dark:text-red-400";
    if (lowerStatus.includes('error')) return "text-red-600 dark:text-red-400";
    if (lowerStatus.includes('timeout')) return "text-yellow-600 dark:text-yellow-400";
    return "text-muted-foreground";
  };

  const getStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('accepted')) return "Đã chấp nhận";
    if (lowerStatus.includes('wrong')) return "Sai đáp án";
    if (lowerStatus.includes('error')) return "Lỗi";
    if (lowerStatus.includes('timeout')) return "Hết thời gian";
    return status;
  };

  const handleNavigateProblem = (targetId: string | null | undefined) => {
    if (!targetId || !id || targetId === problemId) return;
    navigate(`/courses/${id}/problems/${targetId}`);
  };

  const mapDifficulty = (d: number): "Dễ" | "Trung bình" | "Khó" => {
    if (d <= 1) return "Dễ";
    if (d === 2) return "Trung bình";
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
      topics: problem.sub_topic?.sub_topic_name ? [problem.sub_topic.sub_topic_name] : [] as string[],
      companies: [] as string[],
      likes: 0,
      dislikes: 0,
      comments: 0,
      views: 0,
      solved: (problem as any).is_done || false,
    } as const;
  }, [problem]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !problem || !problemData) {
    return (
      <div className="flex h-screen flex-col">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">
            {error || "Không thể tải đề bài"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/courses/${id}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            className="gap-2" 
            onClick={() => navigate(`/courses/${id}/problems`)}
          >
            <List className="h-4 w-4" />
            Danh sách bài tập
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleNavigateProblem(prevProblemId)}
            disabled={!prevProblemId || isLoadingCourse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleNavigateProblem(nextProblemId)}
            disabled={!nextProblemId || isLoadingCourse}
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
                  Mô tả
                </TabsTrigger>
                <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Lịch sử nộp bài
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

              <TabsContent value="submissions" className="m-0 flex-1 overflow-auto scrollbar-custom p-4">
                {isLoadingSubmissions ? (
                  <div className="flex items-center justify-center p-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Chưa có bài nộp nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Điểm số</TableHead>
                          <TableHead>Test cases</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead>Bộ nhớ</TableHead>
                          <TableHead>Ngày nộp</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission._id}>
                            <TableCell>
                              <span className={`font-semibold ${getStatusColor(submission.status)}`}>
                                {getStatusText(submission.status)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className={submission.status.toLowerCase().includes('accepted') 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                  : ""}
                              >
                                {submission.score} điểm
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {submission.test_cases_passed} / {submission.total_test_cases}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {submission.execution_time_ms} ms
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <HardDrive className="h-3 w-3" />
                                {submission.memory_used_mb} MB
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(submission.submitted_at).toLocaleString('vi-VN')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/submissions/${submission._id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
              problemId={problem?._id}
              problemName={problem?.name}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default CourseProblemDetail;

