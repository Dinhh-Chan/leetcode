import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, FileSearch, MessageSquare, Send } from "lucide-react";
import { streamCodeReview } from "@/services/aiReview";
import { toast } from "sonner";
import { MarkdownKatexRenderer } from "@/components/MarkdownKatexRenderer";
import { sessionsService, messagesService } from "@/services";
import { Message } from "@/services/types/messages";

interface AiAssistantPanelProps {
  problemDescription?: string;
  exampleCode?: string;
  userCode: string;
  problemId?: string;
  problemName?: string;
}

const AiAssistantPanel = ({ problemDescription = "", exampleCode = "", userCode, problemId, problemName }: AiAssistantPanelProps) => {
  const [reviewContent, setReviewContent] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [shouldAutoScrollChat, setShouldAutoScrollChat] = useState(true);

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

  // Auto-scroll for chat
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 32;
      setShouldAutoScrollChat(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && shouldAutoScrollChat) {
      requestAnimationFrame(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: isChatting ? "smooth" : "auto" });
      });
    }
  }, [messages, isChatting, shouldAutoScrollChat]);

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId]);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const msgs = await messagesService.getBySessionId(sessionId);
      setMessages(msgs);
    } catch (err: any) {
      console.error("Error loading messages:", err);
    }
  }, [sessionId]);

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

  // Create or get session for chat
  const initializeChatSession = useCallback(async () => {
    if (sessionId) return sessionId;

    try {
      setIsCreatingSession(true);
      const sessionName = problemName 
        ? `Chat về bài: ${problemName}`
        : "Chat với AI về bài tập";
      
      const session = await sessionsService.createSession({
        session_name: sessionName,
        question_id: problemId,
        question_content: problemDescription,
      });
      
      setSessionId(session._id);
      return session._id;
    } catch (err: any) {
      const message = err?.message || "Không thể tạo session chat";
      setChatError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsCreatingSession(false);
    }
  }, [sessionId, problemId, problemName, problemDescription]);

  // Send chat message
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isChatting) return;

    const messageContent = chatInput.trim();
    setChatInput("");
    setChatError(null);

    try {
      setIsChatting(true);
      
      // Ensure session exists
      const currentSessionId = sessionId || await initializeChatSession();
      
      // Add user message to UI immediately
      const tempUserMessage: Message = {
        _id: `temp-${Date.now()}`,
        session_id: currentSessionId,
        role: 'user',
        content: messageContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send to API
      const response = await messagesService.chatWithAI({
        session_id: currentSessionId,
        content: messageContent,
        problem_id: problemId,
      });

      // Replace temp message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempUserMessage._id);
        return [...filtered, response.userMessage, response.aiMessage];
      });
    } catch (err: any) {
      const message = err?.message || "Không thể gửi tin nhắn";
      setChatError(message);
      toast.error(message);
      
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => !msg._id.startsWith('temp-')));
    } finally {
      setIsChatting(false);
    }
  }, [chatInput, isChatting, sessionId, problemId, initializeChatSession]);

  const handleChatKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <TabsTrigger value="chat" className="text-xs flex items-center gap-1">
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
        <TabsContent value="chat" className="m-0 flex-1 p-0 overflow-hidden min-h-0 flex flex-col">
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-auto scrollbar-custom p-4 space-y-4"
          >
            {chatError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p>{chatError}</p>
              </div>
            )}
            
            {messages.length === 0 && !isChatting && !isCreatingSession && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8" />
                <p>Chào bạn! Tôi có thể giúp bạn hiểu bài tập này.</p>
                <p className="text-xs">Hãy gửi câu hỏi của bạn để bắt đầu.</p>
              </div>
            )}

            {isCreatingSession && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Đang khởi tạo chat...</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownKatexRenderer 
                      content={message.content} 
                      className="text-sm prose prose-sm dark:prose-invert max-w-none" 
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isChatting && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>AI đang suy nghĩ...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} className="h-1" />
          </div>
          
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isChatting || isCreatingSession}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatting || isCreatingSession}
                size="icon"
              >
                {isChatting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiAssistantPanel;


