import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Copy, Clock, HardDrive } from "lucide-react";
import { submissionsService, SubmissionDetailResponse } from "@/services/submissions";
import Editor from "@monaco-editor/react";
import { useLanguages } from "@/hooks/useLanguages";
import { Loader2 } from "lucide-react";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetailResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { languages, isLoading: isLoadingLang } = useLanguages();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await submissionsService.getSubmissionDetail(id as string);
        if (mounted) setSubmission(response.data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load submission");
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
    if (lowerStatus.includes('accepted')) return "text-success";
    if (lowerStatus.includes('wrong')) return "text-destructive";
    if (lowerStatus.includes('error')) return "text-destructive";
    if (lowerStatus.includes('timeout')) return "text-warning";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-destructive">{error || "Submission not found"}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Chi tiết bài nộp</h1>
        <Button variant="link" className="p-0 text-primary" onClick={() => navigate(`/problems/${submission.problem._id}`)}>
          {submission.problem?.name || "Unknown Problem"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Trạng thái</div>
            <div className={`text-lg font-bold ${getStatusColor(submission.status)}`}>
              {submission.status.toUpperCase()}
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
            <div className={`text-lg font-semibold ${submission.test_cases_passed === submission.total_test_cases ? 'text-success' : 'text-destructive'}`}>
              {submission.score} / 100
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

      {/* Error Message */}
      {submission.error_message && (
        <Card className="mt-6 border-destructive">
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-destructive mb-2">Lỗi</div>
            <pre className="text-xs text-destructive whitespace-pre-wrap font-mono bg-destructive/10 p-3 rounded border border-destructive/20">
              {submission.error_message}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Submission Info */}
      <div className="mt-6 text-xs text-muted-foreground space-y-1">
        <div>Submission ID: {submission.submission_id}</div>
        <div>Submitted at: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</div>
        {submission.judged_at && (
          <div>Judged at: {new Date(submission.judged_at).toLocaleString('vi-VN')}</div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;

