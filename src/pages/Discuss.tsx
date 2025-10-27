import { ThumbsUp, MessageCircle, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const Discuss = () => {
  const banners = [
    {
      title: "Early Access",
      subtitle: "Be the First to Try LeetCode's Newest Features",
      gradient: "bg-gradient-orange",
      cta: "Learn More",
    },
    {
      title: "Pandas",
      subtitle: "30 Days Challenge - Beginner Friendly",
      gradient: "bg-gradient-blue",
      cta: "Get Started",
    },
    {
      title: "LeetCode's Interview Crash Course",
      subtitle: "System Design for Interviews and Beyond",
      gradient: "bg-gradient-green",
      cta: "Start Learning",
    },
    {
      title: "LeetCode's Interview Crash Course",
      subtitle: "Data Structures and Algorithms",
      gradient: "bg-gradient-purple",
      cta: "Start Learning",
    },
  ];

  const posts = [
    {
      id: 1,
      author: "LeetCode",
      verified: true,
      time: "Sep 23, 2025",
      title: "What to ✨ Ask Leet. Share Story and Win Prizes 🎁",
      excerpt: "👋 Hello LeetCoders! We're excited to introduce a new feature to your coding experience: Leet. Leet is designed to help you explore ideas...",
      votes: 87,
      views: "10.8k",
      comments: 677,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=post1",
    },
    {
      id: 2,
      author: "Anonymous User",
      verified: false,
      time: "an hour ago",
      title: "ZipRecruiter Phone Screening",
      excerpt: "Given 2D string of restaurant names, return max occuring names input: [ ['a', 'b', 'c'], ['a', 'c', 'd'] ] output: ['a', 'c'] Explain...",
      votes: 0,
      views: 41,
      comments: 0,
    },
    {
      id: 3,
      author: "leetgoal_dot_dev",
      verified: false,
      time: "3 hours ago",
      title: "Haven't received contest prizes for 3 weeks - please help",
      excerpt: "Hi everyone, I got 5th in weekly contest 468 https://leetcode.com/contest/weekly-contest-468/ranking/?region=global_v2And 2nd in weekly contest 467...",
      votes: 5,
      views: 103,
      comments: 2,
    },
    {
      id: 4,
      author: "Anonymous User",
      verified: false,
      time: "3 hours ago",
      title: "Meta",
      excerpt: "You are building a tool to assist authors in analyzing their writing style to improve consistency. One key feature examines word structure...",
      votes: 0,
      views: 115,
      comments: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Banner Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`${banner.gradient} relative overflow-hidden rounded-lg p-6 text-white shadow-lg`}
            >
              <div className="relative z-10">
                <h3 className="mb-1 text-lg font-bold">{banner.title}</h3>
                <p className="mb-4 text-sm opacity-90">{banner.subtitle}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-foreground hover:bg-white/90"
                >
                  {banner.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="mb-6 flex items-center justify-between">
              <Tabs defaultValue="for-you" className="flex-1">
                <TabsList>
                  <TabsTrigger value="for-you">🔥 For You</TabsTrigger>
                  <TabsTrigger value="career">Career</TabsTrigger>
                  <TabsTrigger value="contest">Contest</TabsTrigger>
                  <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button className="ml-4">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>

            {/* Sort Options */}
            <div className="mb-4 flex gap-2">
              <Button variant="ghost" size="sm">
                🔥 Most Votes
              </Button>
              <Button variant="ghost" size="sm">
                ✨ Newest
              </Button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.author}</span>
                      {post.verified && <Badge variant="secondary" className="h-5 text-xs">✓</Badge>}
                      <span className="text-sm text-muted-foreground">· {post.time}</span>
                    </div>
                    
                    <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.votes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">🔍 Explore</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">#interview</p>
                    <p className="text-xs text-muted-foreground">ZipRecruiter Phone Screening</p>
                    <p className="text-xs text-muted-foreground">Does any one have LeetCode cha...</p>
                  </div>
                  <div>
                    <p className="font-medium">#compensation</p>
                    <p className="text-xs text-muted-foreground">Does any one have LeetCode cha...</p>
                    <p className="text-xs text-muted-foreground">Taking the Hardest Step — Mov...</p>
                  </div>
                  <div>
                    <p className="font-medium">#career</p>
                    <p className="text-xs text-muted-foreground">Taking the Hardest Step — Mov...</p>
                  </div>
                  <div>
                    <p className="font-medium">#google</p>
                    <p className="text-xs text-muted-foreground">Google Application Engineering Int...</p>
                    <p className="text-xs text-muted-foreground">Seeking a Partner to Improve Low-...</p>
                  </div>
                </div>
                <Button variant="link" className="mt-4 p-0 text-primary">
                  Show More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discuss;
