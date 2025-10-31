import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const EmptyState = ({ title, action }: { title: string; action: string }) => (
  <div className="flex h-full flex-col items-center justify-center">
    <div className="text-sm text-muted-foreground mb-3">{title}</div>
    <Button>{action}</Button>
  </div>
);

const AiAssistantPanel = () => {
  return (
    <div className="h-full">
      <Tabs defaultValue="review" className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b p-2">
          <TabsList className="h-8">
            <TabsTrigger value="review" className="text-xs">Đánh giá code</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Chat với AI</TabsTrigger>
          </TabsList>
          <Button size="sm">Đánh giá</Button>
        </div>
        <TabsContent value="review" className="m-0 flex-1 p-3">
          <EmptyState title="Chưa có đánh giá code nào. Nhấn nút để bắt đầu." action="Đánh giá code của tôi" />
        </TabsContent>
        <TabsContent value="chat" className="m-0 flex-1 p-3">
          <EmptyState title="Bắt đầu trò chuyện với AI để nhận gợi ý." action="Bắt đầu chat" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiAssistantPanel;


