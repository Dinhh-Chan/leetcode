import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Lightbulb } from "lucide-react";

interface ProblemDescriptionProps {
  problemData: {
    id: number;
    title: string;
    difficulty: "Easy" | "Med" | "Hard";
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
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
        return "text-success bg-success/10 border-success/20";
      case "Med":
        return "text-warning bg-warning/10 border-warning/20";
      case "Hard":
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
              <span className="text-xs text-muted-foreground">Topics:</span>
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
        <p className="text-foreground">{problemData.description}</p>

        {problemData.examples.map((example, index) => (
          <div key={index} className="my-4 rounded-lg bg-muted p-4">
            <p className="mb-2 font-semibold text-foreground">Example {index + 1}:</p>
            <div className="space-y-1 font-mono text-sm">
              <p>
                <strong>Input:</strong> {example.input}
              </p>
              <p>
                <strong>Output:</strong> {example.output}
              </p>
              {example.explanation && (
                <p>
                  <strong>Explanation:</strong> {example.explanation}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="my-6">
          <p className="mb-2 font-semibold text-foreground">Constraints:</p>
          <ul className="list-disc space-y-1 pl-5 text-foreground">
            {problemData.constraints.map((constraint, index) => (
              <li key={index} className="text-sm">
                {constraint}
              </li>
            ))}
          </ul>
        </div>

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
