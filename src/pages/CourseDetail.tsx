import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { coursesService } from "@/services/courses";
import { Course } from "@/services/types/courses";
import { MarkdownKatexRenderer } from "@/components/MarkdownKatexRenderer";
import { toast } from "sonner";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await coursesService.getCourse(id);
      setCourse(data);
    } catch (e: any) {
      setError(e?.message || "Không thể tải thông tin khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const handleJoinCourse = async () => {
    if (!id || !course) return;
    try {
      setIsJoining(true);
      await coursesService.joinCourse(id);
      toast.success("Tham gia khóa học thành công!");
      // Reload course data to update is_joined status
      await loadCourse();
    } catch (e: any) {
      toast.error(e?.message || "Không thể tham gia khóa học");
    } finally {
      setIsJoining(false);
    }
  };

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

  const problemsCount = course.problems?.length || 0;
  const studentsCount = course.students?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{course.course_code}</Badge>
                {course.is_active && (
                  <Badge variant="default">Đang hoạt động</Badge>
                )}
              </div>
              <h1 className="mb-4 text-3xl font-bold">{course.course_name}</h1>
              
              {/* Stats */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{problemsCount} bài học</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{studentsCount} người dùng</span>
                </div>
              </div>

              {/* Join button */}
              {course.is_joined === false && (
                <div className="mb-4">
                  <Button
                    onClick={handleJoinCourse}
                    disabled={isJoining}
                    className="w-full sm:w-auto"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tham gia...
                      </>
                    ) : (
                      "Tham gia khóa học"
                    )}
                  </Button>
                </div>
              )}

              {/* View problems button */}
              {problemsCount > 0 && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/courses/${id}/problems`)}
                    className="w-full sm:w-auto"
                  >
                    Xem danh sách bài tập
                  </Button>
                </div>
              )}
            </div>

            {course.description && (
              <div className="prose prose-sm max-w-none">
                <MarkdownKatexRenderer content={course.description} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetail;

