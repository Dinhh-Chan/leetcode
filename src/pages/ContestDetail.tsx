import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Users, FileCode, Award } from "lucide-react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { contestsService } from "@/services";
import { Contest } from "@/services/types/contests";
import { format } from "date-fns";
import { toast } from "sonner";

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadContest = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await contestsService.getContest(id);
      setContest(data);
    } catch (e: any) {
      setError(e?.message || "Không thể tải thông tin cuộc thi");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContest();
  }, [loadContest]);

  const handleJoinContest = async () => {
    if (!id) return;
    
    try {
      setIsJoining(true);
      await contestsService.joinContest(id);
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
    if (!id || !contest) return;
    
    try {
      setIsStarting(true);
      await contestsService.startContest(id, true);
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
  // Assuming ranking is passed in contest object or needs to be fetched separately
  const ranking = (contest as any).ranking || [];
  
  const status = contest.status || 'not-participant';
  const isStart = contest.is_start || false;
  const shouldShowProblemsAndRanking = isStart;
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
                            {index + 1}
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
                              <div className="mt-2 flex gap-2">
                                <Badge variant={item.problem.difficulty === 1 ? 'default' : item.problem.difficulty === 2 ? 'secondary' : 'destructive'}>
                                  {item.problem.difficulty === 1 ? 'Dễ' : item.problem.difficulty === 2 ? 'Trung bình' : 'Khó'}
                                </Badge>
                                <Badge variant="outline">Điểm: {item.score}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Giải bài
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
            {ranking.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có bảng xếp hạng.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {ranking.map((item: any, index: number) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between border-b p-4 last:border-b-0 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex w-12 items-center justify-center">
                          <Badge variant={index === 0 ? 'default' : 'outline'}>
                            {item.rank || index + 1}
                          </Badge>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                          {(item.user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.user?.fullname || item.user?.username || 'Người dùng'}</span>
                            {item.is_manager && (
                              <Badge variant="outline">Quản lý</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Username: {item.user?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{item.accepted_count}</p>
                          <p className="text-xs text-muted-foreground">Bài đã giải</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

