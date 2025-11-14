import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { coursesService } from "@/services/courses";
import { Course, CourseProblem } from "@/services/types/courses";

const mapDifficulty = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return "Dễ";
    case 2:
      return "Trung bình";
    case 3:
      return "Khó";
    default:
      return "Dễ";
  }
};

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return "text-success bg-success/10 border-success/20";
    case 2:
      return "text-warning bg-warning/10 border-warning/20";
    case 3:
      return "text-destructive bg-destructive/10 border-destructive/20";
    default:
      return "text-success bg-success/10 border-success/20";
  }
};

const CourseProblemsList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await coursesService.getCourse(id);
        if (mounted) setCourse(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không thể tải thông tin khóa học");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">
            {error || "Khóa học không tồn tại"}
          </div>
        </div>
      </div>
    );
  }

  const problems = course.problems || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{course.course_name}</h1>
          <p className="mt-2 text-muted-foreground">Danh sách bài tập</p>
        </div>

        {problems.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Khóa học này chưa có bài tập nào
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {problems
              .filter((p) => p.is_visible)
              .sort((a, b) => a.order_index - b.order_index)
              .map((problem: CourseProblem, index: number) => (
                <Card
                  key={problem._id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => navigate(`/courses/${id}/problems/${problem.problem_id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <h3 className="text-xl font-semibold">
                            {problem.problem.name}
                          </h3>
                          {problem.problem.is_done && (
                            <Badge variant="outline" className="gap-1 border-success text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã giải
                            </Badge>
                          )}
                        </div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge
                            className={`border ${getDifficultyColor(problem.problem.difficulty)}`}
                          >
                            {mapDifficulty(problem.problem.difficulty)}
                          </Badge>
                          {problem.is_required && (
                            <Badge variant="destructive">Bắt buộc</Badge>
                          )}
                        </div>
                        {problem.problem.sub_topic?.sub_topic_name && (
                          <p className="text-sm text-muted-foreground">
                            {problem.problem.sub_topic.sub_topic_name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${id}/problems/${problem.problem_id}`);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProblemsList;

