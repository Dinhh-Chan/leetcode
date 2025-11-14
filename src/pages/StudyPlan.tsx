import { useMemo } from "react";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { coursesService } from "@/services/courses";
import { Course } from "@/services/types/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudyPlan = () => {
  const navigate = useNavigate();

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", "study-plan"],
    queryFn: () => coursesService.getActiveCourses(),
  });

  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => a.course_name.localeCompare(b.course_name));
  }, [courses]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Lộ trình học</h1>
              <p className="text-muted-foreground">
                Chọn khóa học phù hợp để luyện tập có định hướng.
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive">
            Không thể tải danh sách khóa học. Vui lòng thử lại sau.
          </div>
        )}

        {!isLoading && !error && sortedCourses.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Chưa có khóa học nào</h2>
            <p className="text-muted-foreground">
              Vui lòng quay lại sau khi có lộ trình học được cập nhật.
            </p>
          </div>
        )}

        {!isLoading && !error && sortedCourses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedCourses.map((course: Course) => (
              <Card key={course._id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{course.course_code}</Badge>
                    {course.is_active && (
                      <span className="text-xs font-medium text-green-600">Đang mở</span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{course.course_name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {course.description || "Khóa học này chưa có mô tả chi tiết."}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button onClick={() => navigate(`/courses/${course._id}/problems`)}>
                      Bắt đầu học
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

export default StudyPlan;

