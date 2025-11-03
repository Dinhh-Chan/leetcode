import { Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useContests } from "@/hooks";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Contest = () => {
  const navigate = useNavigate();
  const {
    contests: ongoingContests,
    isLoadingContests,
    contestsError,
    myContests,
    isLoadingMyContests,
    myContestsError
  , joinContest, isJoining } = useContests();


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center text-white">
          <Trophy className="mx-auto mb-4 h-20 w-20 text-yellow-400" />
          <h1 className="mb-2 text-4xl font-bold">Cuộc Thi Lập Trình</h1>
          <p className="text-lg text-slate-300">Thử thách bản thân và nâng cao kỹ năng lập trình của bạn!</p>
        </div>


        {/* Tabs Section */}
        <Tabs defaultValue="ongoing" className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="ongoing"> Các cuộc thi công khai đang diễn ra</TabsTrigger>
              <TabsTrigger value="my">Cuộc thi của tôi</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ongoing" className="space-y-4">
            <h3 className="mb-4 text-lg font-semibold">Các cuộc thi công khai đang diễn ra</h3>
            {isLoadingContests ? (
              <Card className="p-8 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải cuộc thi...</p>
              </Card>
            ) : contestsError ? (
              <Card className="p-8 text-center">
                <p className="text-destructive">Có lỗi xảy ra khi tải cuộc thi. Vui lòng thử lại sau.</p>
              </Card>
            ) : ongoingContests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Hiện chưa có cuộc thi nào đang diễn ra.</p>
              </Card>
            ) : (
              ongoingContests.map((contest, index) => (
                <Card key={contest._id} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`${index % 2 === 0 ? 'bg-gradient-blue' : 'bg-gradient-green'} flex h-16 w-16 items-center justify-center rounded-lg`}>
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{contest.contest_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contest.description}
                        </p>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span>Bắt đầu: {format(new Date(contest.start_time), 'dd/MM/yyyy HH:mm')}</span>
                          <span>Kết thúc: {format(new Date(contest.end_time), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(() => {
                        const isEnded = new Date(contest.end_time).getTime() <= Date.now();
                        if (isEnded) {
                          return (
                            <Button size="sm" variant="secondary" disabled>
                              Đã kết thúc
                            </Button>
                          );
                        }
                        // Check user status from myContests
                        const mine = myContests.find((mc: any) => mc.contest?._id === contest._id);
                        const myStatus = mine?.status; // 'pending' | 'enrolled'
                        if (myStatus === 'pending') {
                          return (
                            <Button size="sm" variant="secondary" disabled>
                              Chờ được duyệt
                            </Button>
                          );
                        }
                        return (
                          <>
                            {!mine && !contest.is_enrolled && (
                              <Button 
                                size="sm"
                                onClick={() => joinContest(contest._id)}
                                disabled={isJoining}
                              >
                                {isJoining ? 'Đang xử lý...' : 'Đăng ký'}
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/contest/${contest._id}`)}
                            >
                              Xem chi tiết
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="my">
            <h3 className="mb-4 text-lg font-semibold">Cuộc thi của tôi</h3>
            {isLoadingMyContests ? (
              <Card className="p-8 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải cuộc thi...</p>
              </Card>
            ) : myContestsError ? (
              <Card className="p-8 text-center">
                <p className="text-destructive">Có lỗi xảy ra khi tải cuộc thi. Vui lòng thử lại sau.</p>
              </Card>
            ) : myContests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Bạn chưa tham gia cuộc thi nào.</p>
              </Card>
            ) : (
              myContests.map((item, index) => (
                <Card key={item.contest._id} className="mb-4 cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`${index % 2 === 0 ? 'bg-gradient-blue' : 'bg-gradient-green'} flex h-16 w-16 items-center justify-center rounded-lg`}>
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-semibold">{item.contest.contest_name}</h4>
                          <Badge variant={item.status === 'enrolled' ? 'default' : 'secondary'}>
                            {item.status === 'enrolled' ? 'Đã tham gia' : 'Đang chờ duyệt'}
                          </Badge>
                          {item.is_manager && (
                            <Badge variant="outline">Quản lý</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.contest.description}
                        </p>
                        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                          <span>Bắt đầu: {format(new Date(item.contest.start_time), 'dd/MM/yyyy HH:mm')}</span>
                          <span>Kết thúc: {format(new Date(item.contest.end_time), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const isEnded = new Date(item.contest.end_time).getTime() <= Date.now();
                      if (isEnded) {
                        return (
                          <Button size="sm" variant="secondary" disabled>
                            Đã kết thúc
                          </Button>
                        );
                      }
                      return (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/contest/${item.contest._id}`)}
                        >
                          Xem chi tiết
                        </Button>
                      );
                    })()}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contest;
