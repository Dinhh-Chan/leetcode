import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Copy, Clock, HardDrive } from "lucide-react";
import { contestSubmissionsService, ContestSubmissionDetailResponse } from "@/services/contestSubmissions";
import Editor from "@monaco-editor/react";
import { useLanguages } from "@/hooks/useLanguages";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";

const ContestSubmissionDetail = () => {
  const { contestId, id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<ContestSubmissionDetailResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { languages, isLoading: isLoadingLang } = useLanguages();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await contestSubmissionsService.getSubmissionDetail(id as string);
        if (mounted) setSubmission(response.data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không thể tải thông tin bài nộp");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleCopyCode = () => {
    if (submission?.code) {
      navigator.clipboard.writeText(submission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageName = () => {
    if (!submission || !languages.length) return "Unknown";
    const lang = languages.find(l => l.id === submission.language_id);
    return lang?.name || `Language ${submission.language_id}`;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('accepted')) return "text-green-600";
    if (lowerStatus.includes('wrong')) return "text-destructive";
    if (lowerStatus.includes('error')) return "text-destructive";
    if (lowerStatus.includes('timeout')) return "text-orange-600";
    return "text-muted-foreground";
  };

  const getStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('accepted')) return "ACCEPTED";
    if (lowerStatus.includes('wrong')) return "WRONG ANSWER";
    if (lowerStatus.includes('error')) return "ERROR";
    if (lowerStatus.includes('timeout')) return "TIME LIMIT EXCEEDED";
    return status.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="text-destructive">{error || "Không tìm thấy bài nộp"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/contest/${contestId}/problems/${submission.problem_id}`)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại bài tập
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Chi tiết bài nộp</h1>
        <div className="text-sm text-muted-foreground">
          Contest ID: {submission.contest_id}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Trạng thái</div>
            <div className={`text-lg font-bold ${getStatusColor(submission.status)}`}>
              {getStatusText(submission.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Test cases</div>
            <div className="text-lg font-semibold">
              {submission.test_cases_passed} / {submission.total_test_cases}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Điểm số</div>
            <div className={`text-lg font-semibold ${submission.test_cases_passed === submission.total_test_cases ? 'text-green-600' : 'text-destructive'}`}>
              {submission.score}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Thời gian thực thi
            </div>
            <div className="text-lg font-semibold">
              {submission.execution_time_ms} ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Bộ nhớ sử dụng
            </div>
            <div className="text-lg font-semibold">
              {submission.memory_used_mb} MB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Box */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{getLanguageName()}</Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Đã sao chép!" : "Sao chép"}
            </Button>
          </div>
          <div className="p-4" style={{ maxHeight: '600px', overflow: 'auto' }}>
            <Editor
              height="500px"
              language="python"
              value={submission.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Info */}
      <div className="mt-6 text-xs text-muted-foreground space-y-1">
        <div>Submission ID: {submission.submission_id}</div>
        <div>Submitted at: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</div>
        {submission.solved_at && (
          <div>Thời gian hoàn thành: {new Date(submission.solved_at).toLocaleString('vi-VN')}</div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ContestSubmissionDetail;

