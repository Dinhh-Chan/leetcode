import { Trophy, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";

const Contest = () => {
  const upcomingContests = [
    {
      id: 1,
      title: "Weekly Contest 472",
      time: "Sunday 9:30 AM GMT+7",
      startsIn: "3d 23h 11m 22s",
      gradient: "bg-gradient-blue",
    },
    {
      id: 2,
      title: "Biweekly Contest 168",
      time: "Saturday 9:30 PM GMT+7",
      startsIn: "10d 11h 11m 22s",
      gradient: "bg-gradient-green",
    },
  ];

  const pastContests = [
    { id: 471, title: "Weekly Contest 471", date: "Oct 11, 2025 9:30 AM GMT+7" },
    { id: 167, title: "Biweekly Contest 167", date: "Oct 11, 2025 3:30 PM GMT+7" },
    { id: 470, title: "Weekly Contest 470", date: "Oct 5, 2025 9:30 AM GMT+7" },
    { id: 469, title: "Weekly Contest 469", date: "Sep 28, 2025 9:30 AM GMT+7" },
    { id: 166, title: "Biweekly Contest 166", date: "Sep 27, 2025 9:30 PM GMT+7" },
  ];

  const globalRanking = [
    { rank: 1, name: "Minui", country: "🇰🇷", rating: 3703, attended: 26 },
    { rank: 2, name: "Neal_Wu", country: "🇺🇸", rating: 3595, attended: 51 },
    { rank: 3, name: "YawnSean", country: "🇨🇳", rating: 3545, attended: 84 },
    { rank: 4, name: "小羊肖恩", country: "🇨🇳", rating: 3611, attended: 107 },
    { rank: 5, name: "何昱", country: "🇨🇳", rating: 3599, attended: 146 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center text-white">
          <Trophy className="mx-auto mb-4 h-20 w-20 text-yellow-400" />
          <h1 className="mb-2 text-4xl font-bold">LeetCode Contest</h1>
          <p className="text-lg text-slate-300">Contest every week. Compete and see your ranking!</p>
        </div>

        {/* Upcoming Contests */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {upcomingContests.map((contest) => (
            <Card key={contest.id} className="overflow-hidden">
              <div className={`${contest.gradient} relative h-48 p-6`}>
                <div className="absolute right-4 top-4 rounded bg-white/20 p-2 backdrop-blur">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Starts in {contest.startsIn}</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold">{contest.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{contest.time}</p>
                <Button className="w-full">Register</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 text-center">
          <Button variant="link" className="text-primary">
            🎖️ Sponsor a Contest
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="past" className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="past">Past Contests</TabsTrigger>
              <TabsTrigger value="my">My Contests</TabsTrigger>
            </TabsList>
            <Button variant="link" className="text-sm text-muted-foreground">
              ℹ️ What's a Virtual Contest?
            </Button>
          </div>

          <TabsContent value="past" className="space-y-4">
            {pastContests.map((contest, index) => (
              <Card key={contest.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`${index % 2 === 0 ? 'bg-gradient-blue' : 'bg-gradient-green'} flex h-16 w-16 items-center justify-center rounded-lg`}>
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{contest.title}</h4>
                      <p className="text-sm text-muted-foreground">{contest.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Virtual</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="my">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">You haven't participated in any contests yet.</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Global Ranking */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Global Ranking</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              {globalRanking.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between border-b p-4 last:border-b-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-semibold text-muted-foreground">
                      {user.rank}
                    </span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.name}</span>
                        <span>{user.country}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {user.rating} · Attended: {user.attended}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contest;
