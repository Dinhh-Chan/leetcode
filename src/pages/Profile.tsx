import { MapPin, Link as LinkIcon, Eye, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

const Profile = () => {
  const submissions = [
    { name: "Coupon Code Validator", time: "3 months ago" },
    { name: "Maximum Depth of Binary Tree", time: "3 months ago" },
    { name: "Symmetric Tree", time: "3 months ago" },
    { name: "Same Tree", time: "3 months ago" },
    { name: "Binary Tree Inorder Traversal", time: "3 months ago" },
    { name: "Pascal's Triangle", time: "9 months ago" },
    { name: "Merge Sorted Array", time: "9 months ago" },
    { name: "Reverse Prefix of Word", time: "9 months ago" },
  ];

  const languages = [
    { name: "Python3", solved: 79 },
    { name: "MySQL", solved: 11 },
    { name: "Python", solved: 9 },
  ];

  const skills = [
    { category: "Advanced", items: [
      { name: "Dynamic Programming", count: 3 },
      { name: "Tree", count: 1 },
    ]},
    { category: "Intermediate", items: [
      { name: "Math", count: 17 },
      { name: "Hash Table", count: 13 },
      { name: "Database", count: 11 },
    ]},
    { category: "Fundamental", items: [
      { name: "Array", count: 55 },
      { name: "String", count: 32 },
      { name: "Sorting", count: 21 },
    ]},
  ];

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
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <h2 className="mb-1 text-xl font-bold">Dinh Chan</h2>
                <p className="mb-4 text-sm text-muted-foreground">Depth-Coder</p>
                <p className="mb-4 text-2xl font-bold">Rank 1,308,821</p>
                <Button className="w-full">Edit Profile</Button>
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
                <h3 className="mb-4 font-semibold">Community Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>Views</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Last week 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="h-4 w-4 bg-green-500" />
                      <span>Solution</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Last week 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-purple-500" />
                      <span>Discuss</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Last week 0</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span>Reputation</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Last week 0</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Languages</h3>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between text-sm">
                      <span>{lang.name}</span>
                      <Badge variant="secondary">{lang.solved} problems solved</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 p-0 text-sm text-primary">
                  Show more
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Skills</h3>
                {skills.map((level) => (
                  <div key={level.category} className="mb-4">
                    <p className="mb-2 text-sm font-medium">• {level.category}</p>
                    <div className="ml-4 space-y-2">
                      {level.items.map((skill) => (
                        <div key={skill.name} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{skill.name}</span>
                          <Badge variant="outline" className="text-xs">x{skill.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="link" className="mt-2 p-0 text-sm text-primary">
                  Show more
                </Button>
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
                          strokeDasharray={`${(0 / 100) * 440} 440`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-sm text-muted-foreground">Beats</div>
                        <div className="text-3xl font-bold">0<span className="text-lg">%</span></div>
                        <div className="mt-2 text-xs text-muted-foreground">0 Attempting</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Easy</span>
                        <span className="font-semibold">94/907</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">Med.</span>
                        <span className="font-semibold">8/1933</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Hard</span>
                        <span className="font-semibold">0/876</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="mb-2 text-sm text-muted-foreground">Badges</div>
                    <div className="text-4xl font-bold">0</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 text-center">
                    <div className="mb-1 text-xs text-muted-foreground">Locked Badge</div>
                    <div className="font-semibold">Oct LeetCoding Challenge</div>
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
                    <span className="text-muted-foreground">submissions in the past one year</span>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total active days: <strong className="text-foreground">10</strong></span>
                    <span>Max streak: <strong className="text-foreground">3</strong></span>
                    <select className="rounded border bg-background px-2 py-1 text-xs">
                      <option>Current</option>
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
                <TabsTrigger value="recent">📋 Recent AC</TabsTrigger>
                <TabsTrigger value="list">📝 List</TabsTrigger>
                <TabsTrigger value="solutions">✅ Solutions</TabsTrigger>
                <TabsTrigger value="discuss">💬 Discuss</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="mt-6">
                <div className="flex justify-end mb-4">
                  <Button variant="link" className="text-sm text-primary">
                    View all submissions →
                  </Button>
                </div>
                <div className="space-y-2">
                  {submissions.map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <span className="font-medium">{submission.name}</span>
                      <span className="text-sm text-muted-foreground">{submission.time}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No lists created yet.</p>
                </Card>
              </TabsContent>

              <TabsContent value="solutions">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No solutions shared yet.</p>
                </Card>
              </TabsContent>

              <TabsContent value="discuss">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No discussions yet.</p>
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
