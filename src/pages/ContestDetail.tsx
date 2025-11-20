import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Users, FileCode, Award, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { contestsService } from "@/services";
import { Contest, ContestRankingItem } from "@/services/types/contests";
import { format } from "date-fns";
import { toast } from "sonner";

const ContestDetail = () => {
  const { id, contestId } = useParams();
  const contestIdParam = contestId || id; // Support both :id and :contestId for backward compatibility
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [ranking, setRanking] = useState<ContestRankingItem[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  const loadContest = useCallback(async () => {
    if (!contestIdParam) return;
    try {
      setIsLoading(true);
      const data = await contestsService.getContest(contestIdParam);
      setContest(data);
    } catch (e: any) {
      setError(e?.message || "Không thể tải thông tin cuộc thi");
    } finally {
      setIsLoading(false);
    }
  }, [contestIdParam]);

  useEffect(() => {
    loadContest();
  }, [loadContest]);

  const loadRanking = useCallback(async () => {
    if (!contestIdParam) return;
    try {
      setIsLoadingRanking(true);
      const response = await contestsService.getContestRanking(contestIdParam);
      const rankingData = response.data || [];
      setRanking(rankingData);
    } catch (e: any) {
      console.error("Error loading ranking:", e);
      setRanking([]);
    } finally {
      setIsLoadingRanking(false);
    }
  }, [contestIdParam]);

  useEffect(() => {
    // Only load ranking if contest has started
    if (contest && contest.is_start) {
      loadRanking();
    }
  }, [contest, loadRanking]);

  const handleJoinContest = async () => {
    if (!contestIdParam) return;
    
    try {
      setIsJoining(true);
      await contestsService.joinContest(contestIdParam);
      toast.success("Đăng ký thành công! Trạng thái: Đang chờ");
      // Reload contest data to get updated status
      await loadContest();
    } catch (e: any) {
      toast.error(e?.message || "Không thể đăng ký cuộc thi");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartContest = async () => {
    if (!contestIdParam || !contest) return;
    
    try {
      setIsStarting(true);
      await contestsService.startContest(contestIdParam, true);
      toast.success("Bắt đầu cuộc thi thành công!");
      // Reload contest data to get updated is_start status
      await loadContest();
    } catch (e: any) {
      toast.error(e?.message || "Không thể bắt đầu cuộc thi");
    } finally {
      setIsStarting(false);
    }
  };

  const contestUsers = contest?.contest_users || [];
  const contestProblems = contest?.contest_problems || [];
  
  const rankingProblemColumns = useMemo(() => {
    if (contestProblems.length > 0) {
      return contestProblems.map((contestProblem: any, index: number) => ({
        id: contestProblem.problem?._id || contestProblem.problem_id,
        label: `P${index + 1}`,
        name: contestProblem.problem?.name || contestProblem.problem_name || `Bài ${index + 1}`,
        fallbackScore: contestProblem.score,
      }));
    }
    const firstRankingProblems = ranking[0]?.problems || [];
    return firstRankingProblems.map((problem: any, index: number) => ({
      id: problem.problem_id,
      label: `P${index + 1}`,
      name: problem.problem_name || `Bài ${index + 1}`,
      fallbackScore: problem.score,
    }));
  }, [contestProblems, ranking]);

  const getProblemScoreValue = (score: string | number | undefined, fallback: string | number | undefined) => {
    const raw = score ?? fallback ?? 0;
    const parsed = typeof raw === "string" ? parseFloat(raw) : raw;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const calculateTotalScore = (item: ContestRankingItem) => {
    if (item.total_score !== undefined && item.total_score !== null) {
      return item.total_score;
    }
    const problemMap = new Map(item.problems.map((p) => [p.problem_id, p]));
    return rankingProblemColumns.reduce((sum, column) => {
      const data = problemMap.get(column.id);
      const isSolved = data?.is_done ?? data?.is_solved;
      if (isSolved) {
        return sum + getProblemScoreValue(data?.score, column.fallbackScore);
      }
      return sum;
    }, 0);
  };

  const getRankBadgeInfo = (rank: number) => {
    if (rank === 1) {
      return { label: "#1 THE GOAT", className: "bg-amber-100 text-amber-700" };
    }
    if (rank === 2) {
      return { label: "#2 PHÓ GOAT", className: "bg-slate-100 text-slate-700" };
    }
    if (rank === 3) {
      return { label: "#3 Á QUÂN", className: "bg-orange-100 text-orange-700" };
    }
    return { label: `#${rank}`, className: "bg-muted text-muted-foreground" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/contest')} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error || "Không tìm thấy cuộc thi"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = contest.status || 'not-participant';
  const isStart = contest.is_start || false;
  const isEnded = (() => {
    try {
      return new Date(contest.end_time).getTime() <= Date.now();
    } catch {
      return false;
    }
  })();
  const shouldShowProblemsAndRanking = isStart && !isEnded;
  const isParticipant = status !== 'not-participant';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/contest')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Contest Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">{contest.contest_name}</CardTitle>
                  <Badge variant={contest.is_active ? 'default' : 'secondary'}>
                    {contest.is_active ? 'Đang diễn ra' : 'Đã kết thúc'}
                  </Badge>
                </div>
                <p className="mb-4 text-muted-foreground">{contest.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Bắt đầu: </span>
                    <span>{format(new Date(contest.start_time), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Kết thúc: </span>
                    <span>{format(new Date(contest.end_time), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Thời lượng: </span>
                    <span>{contest.duration_minutes} phút</span>
                  </div>
                  <div>
                    <span className="font-semibold">Số bài: </span>
                    <span>{contestProblems.length} / {contest.max_problems}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEnded ? (
                  <Button disabled variant="secondary">
                    Đã kết thúc
                  </Button>
                ) : (
                  <>
                    {status === 'not-participant' && (
                      <Button 
                        onClick={handleJoinContest}
                        disabled={isJoining}
                      >
                        {isJoining ? "Đang xử lý..." : "Đăng ký"}
                      </Button>
                    )}
                    {isParticipant && !isStart && (
                      <Button 
                        onClick={handleStartContest}
                        disabled={isStarting}
                      >
                        {isStarting ? "Đang xử lý..." : "Bắt đầu"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue={shouldShowProblemsAndRanking ? "problems" : "participants"} className="mb-8">
          <TabsList className={`grid w-full ${shouldShowProblemsAndRanking ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {shouldShowProblemsAndRanking && (
              <TabsTrigger value="problems">
                <FileCode className="mr-2 h-4 w-4" />
                Bài tập ({contestProblems.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="participants">
              <Users className="mr-2 h-4 w-4" />
              Người tham gia ({contestUsers.length})
            </TabsTrigger>
            {shouldShowProblemsAndRanking && (
              <TabsTrigger value="ranking">
                <Award className="mr-2 h-4 w-4" />
                Bảng xếp hạng
              </TabsTrigger>
            )}
          </TabsList>

          {/* Problems Tab */}
          {shouldShowProblemsAndRanking && (
            <TabsContent value="problems" className="mt-6">
            {contestProblems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có bài tập nào trong cuộc thi này.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contestProblems.map((item: any, index: number) => (
                  <Card key={item._id} className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <h4 className="mb-1 font-semibold">
                              {item.problem?.name || 'Bài tập không có tiêu đề'}
                            </h4>
                            {item.problem?.topic && (
                              <p className="text-sm text-muted-foreground">
                                {item.problem.topic.topic_name} - {item.problem.sub_topic?.sub_topic_name}
                              </p>
                            )}
                            {item.problem && (
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant={item.problem.difficulty === 1 ? 'default' : item.problem.difficulty === 2 ? 'secondary' : 'destructive'}>
                                  {item.problem.difficulty === 1 ? 'Dễ' : item.problem.difficulty === 2 ? 'Trung bình' : 'Khó'}
                                </Badge>
                                <Badge variant="outline">Điểm: {item.score}</Badge>
                                {item.problem.is_done !== undefined && (
                                  <Badge 
                                    variant={item.problem.is_done ? 'default' : 'outline'} 
                                    className={item.problem.is_done ? 'bg-green-500 hover:bg-green-500/90' : ''}
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {item.problem.is_done ? 'Đã giải' : 'Chưa giải'}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={isEnded}
                          onClick={() => {
                            if (isEnded) return;
                            navigate(`/contest/${contest._id}/problems/${item.problem?._id}`);
                          }}
                        >
                          {isEnded ? 'Đã kết thúc' : 'Giải bài'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </TabsContent>
          )}

          {/* Participants Tab */}
          <TabsContent value="participants" className="mt-6">
            {contestUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có người tham gia nào.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {contestUsers.map((item: any) => (
                  <Card key={item._id} className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                            {(item.user?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.user?.fullname || item.user?.username || 'Người dùng'}</span>
                              {item.is_manager && (
                                <Badge variant="outline">Quản lý</Badge>
                              )}
                              <Badge variant={item.status === 'enrolled' ? 'default' : 'secondary'}>
                                {item.status === 'enrolled' ? 'Đã tham gia' : 'Đang chờ'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Username: {item.user?.username} • Đã giải: {item.accepted_count} bài
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ranking Tab */}
          {shouldShowProblemsAndRanking && (
            <TabsContent value="ranking" className="mt-6">
              {isLoadingRanking ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <LoadingSpinner />
                  </CardContent>
                </Card>
              ) : ranking.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Chưa có bảng xếp hạng.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-3 border-b text-left text-xs font-semibold uppercase tracking-wide">Xếp hạng</th>
                            <th className="px-4 py-3 border-b text-left text-xs font-semibold uppercase tracking-wide">Họ và tên</th>
                            <th className="px-4 py-3 border-b text-left text-xs font-semibold uppercase tracking-wide">Mã sinh viên</th>
                            <th className="px-3 py-3 border-b text-center text-xs font-semibold uppercase tracking-wide">Số bài đã giải</th>
                            <th className="px-3 py-3 border-b text-center text-xs font-semibold uppercase tracking-wide">Tổng điểm</th>
                            {rankingProblemColumns.map((column) => (
                              <th
                                key={column.id || column.label}
                                className="px-3 py-3 border-b text-center text-xs font-semibold uppercase tracking-wide"
                                title={column.name}
                              >
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.map((item) => {
                            const problemMap = new Map(item.problems.map((p) => [p.problem_id, p]));
                            const totalScore = calculateTotalScore(item);
                            const rankInfo = getRankBadgeInfo(item.rank);

                            return (
                              <tr key={item.user._id} className="border-b last:border-0">
                                <td className="px-3 py-3">
                                  <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${rankInfo.className}`}>
                                    {rankInfo.label}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                      {(item.user.fullname || item.user.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-semibold">{item.user.fullname || item.user.username}</div>
                                      <div className="text-xs text-muted-foreground">#{item.user.username}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm">{item.user.username}</td>
                                <td className="px-3 py-3 text-center font-semibold text-primary">{item.accepted_count}</td>
                                <td className="px-3 py-3 text-center font-semibold text-green-600">
                                  {totalScore}
                                </td>
                                {rankingProblemColumns.map((column) => {
                                  const data = column.id ? problemMap.get(column.id) : undefined;
                                  const isSolved = data?.is_done ?? data?.is_solved;
                                  return (
                                    <td key={`${item.user._id}-${column.id || column.label}`} className="px-3 py-3 text-center">
                                      <div
                                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                                          isSolved ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                                        }`}
                                        title={column.name}
                                      >
                                        {isSolved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ContestDetail;

