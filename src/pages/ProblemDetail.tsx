import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
                <p className="text-muted-foreground">Your submissions will appear here...</p>
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
