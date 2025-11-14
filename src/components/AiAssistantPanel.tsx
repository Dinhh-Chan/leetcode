import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, FileSearch, MessageSquare } from "lucide-react";
import { streamCodeReview } from "@/services/aiReview";
import { toast } from "sonner";
import { MarkdownKatexRenderer } from "@/components/MarkdownKatexRenderer";

interface AiAssistantPanelProps {
  problemDescription?: string;
  exampleCode?: string;
  userCode: string;
}

const AiAssistantPanel = ({ problemDescription = "", exampleCode = "", userCode }: AiAssistantPanelProps) => {
  const [reviewContent, setReviewContent] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 32;
      setShouldAutoScroll(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (reviewContent && shouldAutoScroll) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: isReviewing ? "smooth" : "auto" });
      });
    }
  }, [reviewContent, isReviewing, shouldAutoScroll]);

  const payload = useMemo(() => ({
    inputs: {
      purpose: problemDescription,
      example_code: exampleCode,
      user_code: userCode,
    },
    response_mode: "",
    user: "",
  }), [problemDescription, exampleCode, userCode]);

  const handleReview = useCallback(async () => {
    if (!userCode || !userCode.trim()) {
      toast.error("Vui lòng viết code trước khi đánh giá");
      return;
    }

    if (!problemDescription || !problemDescription.trim()) {
      toast.error("Không tìm thấy mô tả bài toán để gửi đánh giá");
      return;
    }

    try {
      setIsReviewing(true);
      setError(null);
      setReviewContent("");
      setShouldAutoScroll(true);

      await streamCodeReview(payload, (chunk) => {
        setReviewContent((prev) => prev + chunk);
      });
    } catch (err: any) {
      const message = err?.message || "Không thể đánh giá code";
      setError(message);
      toast.error(message);
    } finally {
      setIsReviewing(false);
    }
  }, [payload, problemDescription, userCode]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-destructive">
          <AlertCircle className="h-6 w-6" />
          <p>{error}</p>
          <Button size="sm" variant="outline" onClick={handleReview} disabled={isReviewing}>
            Thử lại
          </Button>
        </div>
      );
    }

    if (!reviewContent) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
          {isReviewing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p>AI đang đánh giá code của bạn...</p>
            </>
          ) : (
            <p>Chưa có đánh giá code nào. Nhấn nút "Đánh giá code của tôi" để bắt đầu.</p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full relative">
        <div className="p-6 relative">
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            width: "100%", 
            height: "100%", 
            backgroundImage: "radial-gradient(rgba(114, 135, 253, 0.15) 1px, transparent 1px)", 
            backgroundSize: "24px 24px", 
            backgroundRepeat: "repeat", 
            pointerEvents: "none", 
            maskImage: "radial-gradient(black, transparent)",
            zIndex: -1
          }}></div>
          <MarkdownKatexRenderer content={reviewContent} className="text-sm relative z-10" />
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="review" className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b p-2 bg-muted/30">
          <TabsList className="h-8">
            <TabsTrigger value="review" className="text-xs flex items-center gap-1">
              <FileSearch className="h-3.5 w-3.5" />
              Đánh giá code
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs flex items-center gap-1" disabled>
              <MessageSquare className="h-3.5 w-3.5" />
              Chat với AI
            </TabsTrigger>
          </TabsList>
          <Button 
            size="sm" 
            onClick={handleReview} 
            disabled={isReviewing}
            className="bg-primary hover:bg-primary/90"
          >
            {isReviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đánh giá...
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-4 w-4" />
                Đánh giá
              </>
            )}
          </Button>
        </div>
        <TabsContent value="review" className="m-0 flex-1 p-0 overflow-hidden min-h-0">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-auto scrollbar-custom"
          >
            {renderContent()}
          </div>
        </TabsContent>
        <TabsContent value="chat" className="m-0 flex-1 p-3">
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <p>Tính năng trò chuyện với AI đang được phát triển.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiAssistantPanel;


