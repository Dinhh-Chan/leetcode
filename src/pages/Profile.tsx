import { useState } from "react";
import { MapPin, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { profileService } from "@/services/profile";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "@/constants";

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
  
  // Calculate individual percentages
  const easyPercentage = profile?.easy_ac?.total > 0 ? Math.round((profile.easy_ac.solved / profile.easy_ac.total) * 100) : 0;
  const mediumPercentage = profile?.medium_ac?.total > 0 ? Math.round((profile.medium_ac.solved / profile.medium_ac.total) * 100) : 0;
  const hardPercentage = profile?.hard_ac?.total > 0 ? Math.round((profile.hard_ac.solved / profile.hard_ac.total) * 100) : 0;
  
  // Get avatar initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate heatmap data from activity_data
  const generateHeatmapData = () => {
    if (!profile?.activity_data || profile.activity_data.length === 0) {
      return { cells: [], totalSubmissions: 0, activeDays: 0, maxStreak: 0, monthLabels: [] };
    }

    // Create a map of date -> count
    const activityMap = new Map<string, number>();
    profile.activity_data.forEach(item => {
      activityMap.set(item.date, item.count);
    });

    // Calculate total submissions and active days
    const totalSubmissions = profile.activity_data.reduce((sum, item) => sum + item.count, 0);
    const activeDays = profile.activity_data.length;

    // Calculate max streak
    const sortedDates = [...profile.activity_data]
      .map(item => item.date)
      .sort()
      .map(date => new Date(date).getTime());
    
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: number | null = null;
    
    sortedDates.forEach(date => {
      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      lastDate = date;
    });
    maxStreak = Math.max(maxStreak, currentStreak);

    // Generate cells for the last 371 days (53 weeks)
    // GitHub-style: 53 columns (weeks) x 7 rows (days of week)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start date (371 days ago)
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 370);
    
    // Find the Sunday of the week containing startDate
    const startSunday = new Date(startDate);
    const dayOfWeek = startSunday.getDay();
    startSunday.setDate(startSunday.getDate() - dayOfWeek);

    // Calculate max count for level normalization
    const maxCount = Math.max(...Array.from(activityMap.values()), 1);

    // Generate cells in grid format (53 weeks x 7 days)
    const cells: Array<{ date: Date; count: number; level: number; week: number; day: number }> = [];
    const monthLabels: Array<{ month: string; week: number }> = [];
    const monthSet = new Set<string>();

    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startSunday);
        date.setDate(date.getDate() + (week * 7) + day);
        
        // Skip future dates
        if (date > today) {
          cells.push({ date, count: 0, level: 0, week, day });
          continue;
        }

        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        
        // Determine level based on count (0-4)
        let level = 0;
        if (count > 0) {
          const ratio = count / maxCount;
          if (ratio >= 0.75) level = 4;
          else if (ratio >= 0.5) level = 3;
          else if (ratio >= 0.25) level = 2;
          else level = 1;
        }

        cells.push({ date, count, level, week, day });

        // Track months for labels (only on Sunday of each week)
        if (day === 0) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (!monthSet.has(monthKey)) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthLabels.push({
              month: monthNames[date.getMonth()],
              week: week
            });
            monthSet.add(monthKey);
          }
        }
      }
    }

    return { cells, totalSubmissions, activeDays, maxStreak, monthLabels };
  };

  const heatmapData = generateHeatmapData();

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
                  <AvatarImage 
                    src={user?.avatarUrl ? `${API_CONFIG.baseURL}${user.avatarUrl}` : undefined}
                    alt={profile.fullname || profile.username}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullname || profile.username)}&background=21791f&color=fff&size=128`;
                    }} 
                  />
                  <AvatarFallback>{getInitials(profile.fullname)}</AvatarFallback>
                </Avatar>
                <h2 className="mb-1 text-xl font-bold">{profile.fullname}</h2>
                <p className="mb-4 text-sm text-muted-foreground">{profile.username}</p>
                <p className="mb-4 text-2xl font-bold">Rank {profile.rank.toLocaleString()}</p>
                <Button className="w-full" onClick={() => navigate("/profile/edit")}>Chỉnh sửa hồ sơ</Button>
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
            {/* Problem Solved Card - Full Width */}
            <Card>
              <CardContent className="p-6">
                {/* Total Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Tổng số bài đã giải</h3>
                      <p className="text-sm text-muted-foreground">{totalSolved} / {totalProblems} bài</p>
                    </div>
                    <div className="text-2xl font-bold">{beatsPercentage}%</div>
                  </div>
                  <Progress value={beatsPercentage} className="h-3" />
                </div>

                {/* Individual Difficulty Progress */}
                <div className="space-y-4">
                  {/* Easy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Dễ</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{profile.easy_ac.solved}/{profile.easy_ac.total}</span>
                        <span className="text-xs text-muted-foreground">({easyPercentage}%)</span>
                      </div>
                    </div>
                    <Progress 
                      value={easyPercentage} 
                      className="h-2 [&>div]:bg-green-500" 
                    />
                  </div>

                  {/* Medium */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Trung bình</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{profile.medium_ac.solved}/{profile.medium_ac.total}</span>
                        <span className="text-xs text-muted-foreground">({mediumPercentage}%)</span>
                      </div>
                    </div>
                    <Progress 
                      value={mediumPercentage} 
                      className="h-2 [&>div]:bg-yellow-500" 
                    />
                  </div>

                  {/* Hard */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">Khó</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{profile.hard_ac.solved}/{profile.hard_ac.total}</span>
                        <span className="text-xs text-muted-foreground">({hardPercentage}%)</span>
                      </div>
                    </div>
                    <Progress 
                      value={hardPercentage} 
                      className="h-2 [&>div]:bg-red-500" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Heatmap */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    <span className="text-2xl">{heatmapData.totalSubmissions}</span>{" "}
                    <span className="text-muted-foreground">bài nộp trong một năm qua</span>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tổng số ngày hoạt động: <strong className="text-foreground">{heatmapData.activeDays}</strong></span>
                    <span>Chuỗi tối đa: <strong className="text-foreground">{heatmapData.maxStreak}</strong></span>
                    <select className="rounded border bg-background px-2 py-1 text-xs">
                      <option>Hiện tại</option>
                    </select>
                  </div>
                </div>
                
                {/* Heatmap Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {/* Grid Container - 53 columns (weeks) x 7 rows (days) */}
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(53, 12px)', gridTemplateRows: 'repeat(7, 12px)' }}>
                      {Array.from({ length: 7 }).map((_, dayIndex) => 
                        Array.from({ length: 53 }).map((_, weekIndex) => {
                          const cellIndex = weekIndex * 7 + dayIndex;
                          const cell = heatmapData.cells[cellIndex];
                          
                          if (!cell) return null;
                          
                          const dateStr = cell.date.toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          });
                          
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className={`h-3 w-3 rounded-sm transition-colors hover:ring-2 hover:ring-primary ${
                                cell.level === 0 ? 'bg-muted dark:bg-muted/50' :
                                cell.level === 1 ? 'bg-green-200 dark:bg-green-900' :
                                cell.level === 2 ? 'bg-green-400 dark:bg-green-700' :
                                cell.level === 3 ? 'bg-green-600 dark:bg-green-600' :
                                'bg-green-800 dark:bg-green-500'
                              }`}
                              title={`${dateStr}: ${cell.count} bài nộp`}
                              style={{ 
                                gridColumn: weekIndex + 1,
                                gridRow: dayIndex + 1
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                    
                    {/* Month Labels */}
                    {heatmapData.monthLabels.length > 0 && (
                      <div className="mt-2 flex text-xs text-muted-foreground" style={{ position: 'relative', width: '100%' }}>
                        {heatmapData.monthLabels.map((label, index) => (
                          <span
                            key={index}
                            style={{ 
                              position: 'absolute', 
                              left: `${((label.week + 0.5) / 53) * 100}%`,
                              transform: 'translateX(-50%)'
                            }}
                          >
                            {label.month}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Tabs */}
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">📋 AC gần đây</TabsTrigger>
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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
