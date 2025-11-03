import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Lightbulb } from "lucide-react";
import KMark from "@/components/KMark";

interface ProblemDescriptionProps {
  problemData: {
    id: number;
    title: string;
    difficulty: "Easy" | "Med" | "Hard" | "Dễ" | "Trung bình" | "Khó";
    description: string;
    guidelines?: string;
    solution?: string;
    constraints: string[];
    followUp?: string;
    topics: string[];
    companies: string[];
    likes: number;
    dislikes: number;
    comments: number;
    views: number;
    solved: boolean;
  };
}

const ProblemDescription = ({ problemData }: ProblemDescriptionProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
      case "Dễ":
        return "text-success bg-success/10 border-success/20";
      case "Med":
      case "Trung bình":
        return "text-warning bg-warning/10 border-warning/20";
      case "Hard":
      case "Khó":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "";
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold">
          {problemData.id}. {problemData.title}
          {problemData.solved && (
            <span className="ml-3 text-sm text-success">✓ Solved</span>
          )}
        </h1>
        
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className={`border ${getDifficultyColor(problemData.difficulty)}`}>
            {problemData.difficulty}
          </Badge>
          
          {problemData.topics.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Chủ đề:</span>
              {problemData.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-muted">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
          
          {problemData.companies.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Companies:</span>
              {problemData.companies.map((company) => (
                <Badge key={company} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {company}
                </Badge>
              ))}
            </div>
          )}
          
          <Button variant="ghost" size="sm" className="ml-auto gap-1">
            <Lightbulb className="h-4 w-4" />
            Hint
          </Button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <KMark content={problemData.description} />

        {/* Testcases moved to CodeEditor bottom panel */}

        {problemData.followUp && (
          <div className="my-6">
            <p className="mb-2 font-semibold text-foreground">Follow-up:</p>
            <p className="text-foreground">{problemData.followUp}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4 border-t pt-4">
        <Button variant="ghost" size="sm" className="gap-1">
          <ThumbsUp className="h-4 w-4" />
          {problemData.likes}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1">
          <ThumbsDown className="h-4 w-4" />
          {problemData.dislikes}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1">
          <MessageSquare className="h-4 w-4" />
          {problemData.comments}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          {problemData.views}
        </Button>
      </div>
    </div>
  );
};

export default ProblemDescription;
