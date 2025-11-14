import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { problemsService } from "@/services";
import { Problem } from "@/services/types/problems";
import { useNavigate } from "react-router-dom";
import { Target, Loader2 } from "lucide-react";
import { DIFFICULTY_COLORS } from "@/constants";

const DIFFICULTY_LABEL = (d: number): 'Dễ' | 'Trung bình' | 'Khó' => {
  if (d <= 2) return 'Dễ';
  if (d === 3) return 'Trung bình';
  return 'Khó';
};

const DailyChallenge = () => {
  const navigate = useNavigate();
  
  // Get problems list and filter unsolved ones, then pick random based on today's date
  const { data: problemsData, isLoading } = useQuery({
    queryKey: ['daily-challenge-problem', new Date().toDateString()],
    queryFn: async () => {
      try {
        // Get a larger list of problems to have more options
        const response = await problemsService.getProblems(1, 100, {});
        
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure:', response);
          return null;
        }
        
        const unsolvedProblems = response.data.filter(p => {
          // Ensure problem has _id and is not solved
          return p && p._id && !p.is_done;
        });
        
        if (unsolvedProblems.length === 0) {
          return null;
        }
        
        // Use today's date as seed for consistent random selection per day
        const today = new Date();
        const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Simple seeded random function
        let seed = dateSeed;
        const seededRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
        
        // Pick random problem using seeded random
        const randomIndex = Math.floor(seededRandom() * unsolvedProblems.length);
        const selectedProblem = unsolvedProblems[randomIndex];
        
        // Validate selected problem has _id
        if (!selectedProblem || !selectedProblem._id) {
          console.error('Selected problem missing _id:', selectedProblem);
          return null;
        }
        
        return selectedProblem;
      } catch (error) {
        console.error('Error fetching daily challenge problem:', error);
        return null;
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (daily challenge)
    refetchOnWindowFocus: false,
  });

  const challengeProblem = useMemo(() => {
    if (!problemsData) return null;
    const problem = problemsData as Problem;
    // Validate that problem has _id
    if (!problem._id) {
      console.error('Problem missing _id:', problem);
      return null;
    }
    return problem;
  }, [problemsData]);

  const handleNavigate = () => {
    if (!challengeProblem?._id) {
      console.error('Cannot navigate: problem ID is missing');
      return;
    }
    navigate(`/problems/${challengeProblem._id}`);
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Thử thách hôm nay của bạn</h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challengeProblem || !challengeProblem._id) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Thử thách hôm nay của bạn</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {problemsData ? 'Không tìm thấy bài tập phù hợp' : 'Bạn đã hoàn thành tất cả các bài tập!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const difficultyLabel = DIFFICULTY_LABEL(challengeProblem.difficulty);

  return (
    <Card className="mb-4 cursor-pointer transition-colors hover:bg-muted/50" onClick={handleNavigate}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Thử thách hôm nay của bạn</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium line-clamp-2">{challengeProblem.name || 'Unnamed Problem'}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[difficultyLabel]}`}>
              {difficultyLabel}
            </Badge>
            {challengeProblem.topic?.topic_name && (
              <Badge variant="outline" className="text-xs">
                {challengeProblem.topic.topic_name}
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            Bắt đầu thử thách
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RightSidebar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  return (
    <aside className="w-80 border-l bg-card p-4">
      <DailyChallenge />
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Lịch</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            formatters={{
              formatCaption: (date) => format(date, "MM/yyyy")
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
