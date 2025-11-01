import { useState } from "react";
import { MapPin, Link as LinkIcon, Eye, MessageCircle, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { profileService } from "@/services/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?._id],
    queryFn: () => profileService.getProfile(),
    enabled: !!user?._id,
    retry: false,
  });

  // Format recent AC submissions
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Calculate beats percentage
  const totalSolved = (profile?.easy_ac?.solved || 0) + (profile?.medium_ac?.solved || 0) + (profile?.hard_ac?.solved || 0);
  const totalProblems = (profile?.easy_ac?.total || 0) + (profile?.medium_ac?.total || 0) + (profile?.hard_ac?.total || 0);
  const beatsPercentage = totalSolved > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  
  // Get avatar initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">
            {error ? "Failed to load profile" : "Profile not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Profile Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="mx-auto mb-4 h-24 w-24">
                  <AvatarImage src="/default-avatar.png" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname || profile.username)}&background=21791f&color=fff&size=128`;
                  }} />
                  <AvatarFallback>{getInitials(profile.fullname)}</AvatarFallback>
                </Avatar>
                <h2 className="mb-1 text-xl font-bold">{profile.fullname}</h2>
                <p className="mb-4 text-sm text-muted-foreground">{profile.username}</p>
                <p className="mb-4 text-2xl font-bold">Rank {profile.rank.toLocaleString()}</p>
                <Button className="w-full" onClick={() => navigate("/profile/edit")}>Chỉnh sửa hồ sơ</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Vietnam</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="h-4 w-4" />
                  <span>Dinh-Chan</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Thống kê cộng đồng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>Lượt xem</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tuần trước 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="h-4 w-4 bg-green-500" />
                      <span>Giải pháp</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tuần trước 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-purple-500" />
                      <span>Thảo luận</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tuần trước 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span>Danh tiếng</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tuần trước 0</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Ngôn ngữ</h3>
                <div className="space-y-3">
                  {(showAllLanguages ? profile.languages : profile.languages.slice(0, 3)).map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{lang.language}</span>
                      <Badge variant="secondary">{lang.problems_solved} bài đã giải</Badge>
                    </div>
                  ))}
                </div>
                {profile.languages.length > 3 && (
                  <Button 
                    variant="link" 
                    className="mt-4 p-0 text-sm text-primary"
                    onClick={() => setShowAllLanguages(!showAllLanguages)}
                  >
                    {showAllLanguages ? 'Ẩn bớt' : 'Xem thêm'}
                </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Kỹ năng</h3>
                <div className="space-y-2">
                  {(showAllSkills ? profile.skills : profile.skills.slice(0, 5)).map((skill) => (
                    <div key={skill.sub_topic_id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{skill.sub_topic_name}</span>
                      <Badge variant="outline" className="text-xs">x{skill.problems_solved}</Badge>
                        </div>
                      ))}
                    </div>
                {profile.skills.length > 5 && (
                  <Button 
                    variant="link" 
                    className="mt-2 p-0 text-sm text-primary"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                  >
                    {showAllSkills ? 'Ẩn bớt' : 'Xem thêm'}
                </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards - New Layout */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Problem Solved Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Circular Progress */}
                    <div className="relative">
                      <svg className="h-40 w-40 -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(beatsPercentage / 100) * 440} 440`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-sm text-muted-foreground">Tỷ lệ</div>
                        <div className="text-3xl font-bold">{beatsPercentage}<span className="text-lg">%</span></div>
                        <div className="mt-2 text-xs text-muted-foreground">{totalSolved} Đã giải</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Easy</span>
                        <span className="font-semibold">{profile.easy_ac.solved}/{profile.easy_ac.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">Med.</span>
                        <span className="font-semibold">{profile.medium_ac.solved}/{profile.medium_ac.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Hard</span>
                        <span className="font-semibold">{profile.hard_ac.solved}/{profile.hard_ac.total}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                      <div className="mb-2 text-sm text-muted-foreground">Huy hiệu</div>
                    <div className="text-4xl font-bold">0</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 text-center">
                      <div className="mb-1 text-xs text-muted-foreground">Huy hiệu bị khóa</div>
                      <div className="font-semibold">Thử thách LeetCode tháng 10</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submission Heatmap */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    <span className="text-2xl">31</span>{" "}
                    <span className="text-muted-foreground">bài nộp trong một năm qua</span>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tổng số ngày hoạt động: <strong className="text-foreground">10</strong></span>
                    <span>Chuỗi tối đa: <strong className="text-foreground">3</strong></span>
                    <select className="rounded border bg-background px-2 py-1 text-xs">
                      <option>Hiện tại</option>
                    </select>
                  </div>
                </div>
                
                {/* Heatmap Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {/* Grid Container */}
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(53, 12px)' }}>
                      {Array.from({ length: 371 }).map((_, i) => {
                        // Sample data - replace with actual data
                        let level = 0;
                        if (i === 28 || i === 99 || i === 170) level = 1;
                        if (i === 223 || i === 226) level = 2;
                        if (i === 318 || i === 324 || i === 327) level = 3;
                        if (i === 370) level = 4;
                        
                        return (
                          <div
                            key={i}
                            className={`h-3 w-3 rounded-sm ${
                              level === 0 ? 'bg-muted' :
                              level === 1 ? 'bg-green-200' :
                              level === 2 ? 'bg-green-400' :
                              level === 3 ? 'bg-green-600' :
                              'bg-green-800'
                            }`}
                            title={`${level} submissions`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Month Labels */}
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Oct</span>
                      <span>Nov</span>
                      <span>Dec</span>
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Tabs */}
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">📋 AC gần đây</TabsTrigger>
                <TabsTrigger value="list">📝 Danh sách</TabsTrigger>
                <TabsTrigger value="solutions">✅ Giải pháp</TabsTrigger>
                <TabsTrigger value="discuss">💬 Thảo luận</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="space-y-2">
                  {profile.recent_ac.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">Chưa có bài nộp được chấp nhận gần đây.</p>
                    </Card>
                  ) : (
                    profile.recent_ac.map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                        <span className="font-medium">{submission.problem_name}</span>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(submission.solved_at)}</span>
                    </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có danh sách nào được tạo.</p>
                </Card>
              </TabsContent>

              <TabsContent value="solutions">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có giải pháp nào được chia sẻ.</p>
                </Card>
              </TabsContent>

              <TabsContent value="discuss">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Chưa có thảo luận nào.</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
