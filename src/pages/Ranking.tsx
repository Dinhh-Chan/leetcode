import { Award, Medal, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { submissionsService } from "@/services/submissions";
import { useQuery } from "@tanstack/react-query";

const Ranking = () => {
  const { data: rankingData, isLoading, error } = useQuery({
    queryKey: ['ranking'],
    queryFn: () => submissionsService.getRanking(200),
    retry: 2,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    }
    if (rank === 2) {
      return <Medal className="h-6 w-6 text-gray-400" />;
    }
    if (rank === 3) {
      return <Medal className="h-6 w-6 text-amber-600" />;
    }
    return <Award className="h-5 w-5 text-muted-foreground" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    if (rank === 2) return "bg-gray-400/20 text-gray-600 dark:text-gray-400";
    if (rank === 3) return "bg-amber-600/20 text-amber-600 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center text-white">
          <Award className="mx-auto mb-4 h-20 w-20 text-yellow-400" />
          <h1 className="mb-2 text-4xl font-bold">Bảng Xếp Hạng</h1>
          <p className="text-lg text-slate-300">Xem những người dùng hàng đầu và số bài đã giải của họ!</p>
        </div>

        {/* Ranking Table */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải bảng xếp hạng...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive">Có lỗi xảy ra khi tải bảng xếp hạng. Vui lòng thử lại sau.</p>
          </Card>
        ) : !rankingData?.data || rankingData.data.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Chưa có dữ liệu xếp hạng.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Hạng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Người dùng</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Số bài đã giải</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.data.map((item, index) => (
                      <tr
                        key={item.user._id}
                        className={`border-b transition-colors hover:bg-muted/50 ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getRankIcon(item.rankNumber)}
                            <Badge
                              variant="outline"
                              className={`font-semibold ${getRankBadgeColor(item.rankNumber)}`}
                            >
                              #{item.rankNumber}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src="/default-avatar.png"
                                alt={item.user.fullName || item.user.username}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    item.user.fullName || item.user.username || "U"
                                  )}&background=21791f&color=fff&size=128`;
                                }}
                              />
                              <AvatarFallback>
                                {getInitials(item.user.fullName || item.user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                {item.user.fullName || item.user.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{item.user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant="secondary" className="text-base font-semibold">
                              {item.totalProblemsSolved}
                            </Badge>
                            <span className="text-sm text-muted-foreground">bài</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ranking;

