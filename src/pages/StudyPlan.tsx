import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/services/courses";
import { Course } from "@/services/types/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GraduationCap, BookOpen, Sparkles, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarkdownKatexRenderer } from "@/components/MarkdownKatexRenderer";
import { toast } from "sonner";

interface GeneratedCourseData {
  course_id: string;
  course_name: string;
  course_code: string;
  description: string;
  problems: Array<{
    problem_id: string;
    name: string;
    description: string;
    difficulty: number;
    topic_name: string;
    sub_topic_name: string;
  }>;
  advice?: any;
  user_assessment?: string;
  learning_path?: any[];
  summary?: string;
  estimated_total_time?: string;
}

const StudyPlan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [learningGoal, setLearningGoal] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [generatedCourseDialogOpen, setGeneratedCourseDialogOpen] = useState(false);
  const [generatedCourseData, setGeneratedCourseData] = useState<GeneratedCourseData | null>(null);

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", "study-plan"],
    queryFn: () => coursesService.getActiveCourses(),
  });

  // Generate AI course mutation
  const generateAICourseMutation = useMutation({
    mutationFn: async ({ goal, notes }: { goal: string; notes?: string }) => {
      return coursesService.generateAICourse(goal, notes);
    },
    onSuccess: (data) => {
      if (data.data) {
        setGeneratedCourseData(data.data);
        setGeneratedCourseDialogOpen(true);
        setAiDialogOpen(false);
        setLearningGoal("");
        setAdditionalNotes("");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể tạo lộ trình học. Vui lòng thử lại sau.");
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return coursesService.deleteCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "study-plan"] });
      toast.success("Đã xóa khóa học");
      setGeneratedCourseDialogOpen(false);
      setGeneratedCourseData(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể xóa khóa học. Vui lòng thử lại sau.");
    },
  });

  // Handle use course
  const handleUseCourse = () => {
    if (generatedCourseData?.course_id) {
      queryClient.invalidateQueries({ queryKey: ["courses", "study-plan"] });
      setGeneratedCourseDialogOpen(false);
      navigate(`/courses/${generatedCourseData.course_id}`);
      setGeneratedCourseData(null);
    }
  };

  // Handle delete course
  const handleDeleteCourse = () => {
    if (generatedCourseData?.course_id) {
      deleteCourseMutation.mutate(generatedCourseData.course_id);
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (difficulty === 2) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty === 1) return "Dễ";
    if (difficulty === 2) return "Trung bình";
    return "Khó";
  };

  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => a.course_name.localeCompare(b.course_name));
  }, [courses]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Lộ trình học</h1>
                <p className="text-muted-foreground">
                  Chọn khóa học phù hợp để luyện tập có định hướng.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setAiDialogOpen(true)}
              className="gap-2"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              AI tư vấn lộ trình học cho bạn
            </Button>
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
                  <div className="text-xs leading-snug text-muted-foreground max-h-40 overflow-auto pr-1">
                    {course.description ? (
                      <MarkdownKatexRenderer
                        content={course.description}
                        className="prose prose-sm max-w-none text-muted-foreground text-xs leading-snug [&>*]:text-xs [&>*]:leading-snug prose-headings:text-sm prose-headings:font-semibold"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Khóa học này chưa có mô tả chi tiết.
                      </p>
                    )}
                  </div>
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

        {/* AI Course Generation Dialog */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI tư vấn lộ trình học
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="learning-goal">Mục tiêu học tập *</Label>
                <Select value={learningGoal} onValueChange={setLearningGoal}>
                  <SelectTrigger id="learning-goal">
                    <SelectValue placeholder="Chọn mục tiêu học tập của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Học để phỏng vấn</SelectItem>
                    <SelectItem value="icpc_contest">Học để thi ICPC/Contest</SelectItem>
                    <SelectItem value="understand_algorithm">Học để hiểu thuật toán</SelectItem>
                    <SelectItem value="career_change">Học để chuyển ngành cấp tốc</SelectItem>
                    <SelectItem value="reinforce_oop_dsa">Học để củng cố OOP/DSA cho công việc</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  AI sẽ phân tích và tạo lộ trình học phù hợp với mục tiêu của bạn
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-notes">Ghi chú thêm (tùy chọn)</Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Ví dụ: Tôi muốn tập trung vào các bài toán về mảng và chuỗi..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả thêm về nhu cầu học tập của bạn để AI tạo lộ trình chính xác hơn
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Lưu ý:</strong> Quá trình tạo lộ trình học có thể mất 10-30 giây do AI cần phân tích và đề xuất bài tập phù hợp.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAiDialogOpen(false);
                  setLearningGoal("");
                  setAdditionalNotes("");
                }}
                disabled={generateAICourseMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (!learningGoal) {
                    toast.error("Vui lòng chọn mục tiêu học tập");
                    return;
                  }
                  generateAICourseMutation.mutate({
                    goal: learningGoal,
                    notes: additionalNotes || undefined,
                  });
                }}
                disabled={!learningGoal || generateAICourseMutation.isPending}
                className="gap-2"
              >
                {generateAICourseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo lộ trình...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Tạo lộ trình học
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generated Course Review Dialog */}
        <Dialog open={generatedCourseDialogOpen} onOpenChange={setGeneratedCourseDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Lộ trình học đã được tạo
              </DialogTitle>
              <DialogDescription>
                Xem lại thông tin khóa học và danh sách bài tập. Bạn có muốn sử dụng lộ trình này không?
              </DialogDescription>
            </DialogHeader>

            {generatedCourseData && (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Course Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{generatedCourseData.course_name}</h3>
                      <Badge variant="secondary">{generatedCourseData.course_code}</Badge>
                    </div>
                    {generatedCourseData.description && (
                      <div className="text-sm text-muted-foreground">
                        <MarkdownKatexRenderer
                          content={generatedCourseData.description}
                          className="prose prose-sm max-w-none text-muted-foreground"
                        />
                      </div>
                    )}
                    {generatedCourseData.estimated_total_time && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Thời gian ước tính:</strong> {generatedCourseData.estimated_total_time}
                      </p>
                    )}
                  </div>

                  {/* Problems List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      Danh sách bài tập ({generatedCourseData.problems?.length || 0} bài)
                    </h4>
                    <div className="space-y-2">
                      {generatedCourseData.problems && generatedCourseData.problems.length > 0 ? (
                        generatedCourseData.problems.map((problem, index) => (
                          <Card key={problem.problem_id} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    #{index + 1}
                                  </span>
                                  <h5 className="font-medium">{problem.name}</h5>
                                  <Badge
                                    className={`text-xs ${getDifficultyColor(problem.difficulty)}`}
                                  >
                                    {getDifficultyText(problem.difficulty)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{problem.topic_name}</span>
                                  {problem.sub_topic_name && (
                                    <>
                                      <span>•</span>
                                      <span>{problem.sub_topic_name}</span>
                                    </>
                                  )}
                                </div>
                                {problem.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {problem.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có bài tập nào</p>
                      )}
                    </div>
                  </div>

                  {/* User Assessment */}
                  {generatedCourseData.user_assessment && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                      <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                        Đánh giá năng lực
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                        {generatedCourseData.user_assessment}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleDeleteCourse}
                disabled={deleteCourseMutation.isPending}
                className="gap-2"
              >
                {deleteCourseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hủy và xóa
                  </>
                )}
              </Button>
              <Button
                onClick={handleUseCourse}
                disabled={deleteCourseMutation.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Sử dụng lộ trình này
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudyPlan;

