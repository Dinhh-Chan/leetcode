import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Users, FileCode, Award, CheckCircle2 } from "lucide-react";
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
  const [ranking, setRanking] = useState<any[]>([]);
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
      const rankingData = response.data?.ranking || [];
      setRanking(rankingData);
      // Debug: log first ranking item to check score
      if (rankingData.length > 0) {
        console.log("First ranking item:", rankingData[0]);
      }
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

  const contestUsers = contest.contest_users || [];
  const contestProblems = contest.contest_problems || [];
  
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
                    <table className="w-full border-collapse">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-center text-xs font-semibold border-b min-w-[60px]">Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold border-b min-w-[200px]">Team/User</th>
                          {contestProblems.map((contestProblem: any, idx: number) => {
                            const problemId = contestProblem.problem?._id || contestProblem.problem_id;
                            return (
                              <th 
                                key={problemId || idx}
                                className="px-3 py-3 text-center text-xs font-semibold border-b min-w-[80px] cursor-pointer hover:bg-muted/70"
                                onClick={() => problemId && navigate(`/contest/${contestIdParam}/problems/${problemId}`)}
                              >
                                <div className="font-bold">{String.fromCharCode(65 + idx)}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-[80px]">{contestProblem.problem?.name?.slice(0, 12) || `Bài ${idx + 1}`}</div>
                              </th>
                            );
                          })}
                          <th className="px-4 py-3 text-center text-xs font-semibold border-b min-w-[80px] bg-primary/10">
                            <div className="font-bold">Score</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Total</div>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold border-b min-w-[60px] bg-primary/10">
                            <div className="font-bold">AC</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((item: ContestRankingItem) => {
                          // Create a map of problem_id to problem data for quick lookup
                          const problemMap = new Map(item.problems.map(p => [p.problem_id, p]));

                          // Calculate total score
                          const totalScore = contestProblems.reduce((sum, contestProblem: any) => {
                            const problemId = contestProblem.problem?._id || contestProblem.problem_id;
                            const problemData = problemId ? problemMap.get(problemId) : null;
                            
                            if (problemData?.is_solved) {
                              // Priority: problemData.score > contestProblem.score
                              let scoreToAdd = null;
                              
                              if (problemData.score !== undefined && problemData.score !== null && problemData.score !== '') {
                                scoreToAdd = typeof problemData.score === 'string' ? parseFloat(problemData.score) : problemData.score;
                              } else if (contestProblem.score !== undefined && contestProblem.score !== null && contestProblem.score !== '') {
                                scoreToAdd = typeof contestProblem.score === 'string' ? parseFloat(contestProblem.score) : contestProblem.score;
                              }
                              
                              if (scoreToAdd !== null && !isNaN(scoreToAdd)) {
                                return sum + scoreToAdd;
                              }
                            }
                            return sum;
                          }, 0);

                          return (
                            <tr
                              key={item.user._id}
                              className={`border-b hover:bg-muted/30 transition-colors ${item.rank <= 3 ? 'bg-primary/5' : ''}`}
                            >
                              <td className="px-3 py-3 text-center border-r">
                                <Badge variant={item.rank === 1 ? 'default' : item.rank === 2 ? 'secondary' : item.rank === 3 ? 'outline' : 'outline'}>
                                  {item.rank}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 border-r">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold flex-shrink-0">
                                    {(item.user.username || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm truncate">{item.user.fullname || item.user.username}</div>
                                    <div className="text-xs text-muted-foreground truncate">@{item.user.username}</div>
                                  </div>
                                </div>
                              </td>
                              {contestProblems.map((contestProblem: any, idx: number) => {
                                const problemId = contestProblem.problem?._id || contestProblem.problem_id;
                                const problemData = problemId ? problemMap.get(problemId) : null;
                                
                                return (
                                  <td 
                                    key={problemId || idx}
                                    className={`px-3 py-3 text-center border-r ${
                                      problemData?.is_solved 
                                        ? 'bg-green-50 dark:bg-green-950/20' 
                                        : 'bg-muted/20'
                                    }`}
                                  >
                                    {problemData ? (
                                      problemData.is_solved ? (
                                        <div className="flex flex-col items-center">
                                          <span className="text-green-600 dark:text-green-400 font-bold text-sm">✓</span>
                                          {(problemData.score !== undefined && problemData.score !== null && problemData.score !== '') || 
                                           (contestProblem.score !== undefined && contestProblem.score !== null && contestProblem.score !== '') ? (
                                            <span className="text-xs text-muted-foreground mt-0.5">
                                              {(() => {
                                                let scoreValue = null;
                                                if (problemData.score !== undefined && problemData.score !== null && problemData.score !== '') {
                                                  scoreValue = typeof problemData.score === 'string' ? parseFloat(problemData.score) : problemData.score;
                                                } else if (contestProblem.score !== undefined && contestProblem.score !== null && contestProblem.score !== '') {
                                                  scoreValue = typeof contestProblem.score === 'string' ? parseFloat(contestProblem.score) : contestProblem.score;
                                                }
                                                return scoreValue !== null && !isNaN(scoreValue) ? scoreValue.toFixed(1) : '-';
                                              })()}
                                            </span>
                                          ) : null}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-center border-r bg-primary/10 font-bold">
                                {totalScore.toFixed(1)}
                              </td>
                              <td className="px-4 py-3 text-center bg-primary/10 font-bold text-primary">
                                {item.accepted_count}
                              </td>
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

