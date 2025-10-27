import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, List, Settings, Bell } from "lucide-react";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");

  // Mock data - in real app, fetch from API
  const problemData = {
    id: Number(id) || 1,
    title: "Two Sum",
    difficulty: "Easy" as const,
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
    followUp: "Can you come up with an algorithm that is less than O(n²) time complexity?",
    topics: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Microsoft"],
    likes: 64800,
    dislikes: 2100,
    comments: 1600,
    views: 1895,
    solved: true,
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/problems")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="gap-2">
            <List className="h-4 w-4" />
            Problem List
          </Button>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">0</span>
          <Button variant="ghost" className="text-primary hover:text-primary">
            Premium
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent px-4">
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Description
              </TabsTrigger>
              <TabsTrigger value="editorial" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Editorial
              </TabsTrigger>
              <TabsTrigger value="solutions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Solutions
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="m-0 flex-1 overflow-hidden">
              <ProblemDescription problemData={problemData} />
            </TabsContent>

            <TabsContent value="editorial" className="m-0 flex-1 overflow-auto p-6">
              <p className="text-muted-foreground">Editorial content coming soon...</p>
            </TabsContent>

            <TabsContent value="solutions" className="m-0 flex-1 overflow-auto p-6">
              <p className="text-muted-foreground">Community solutions coming soon...</p>
            </TabsContent>

            <TabsContent value="submissions" className="m-0 flex-1 overflow-auto p-6">
              <p className="text-muted-foreground">Your submissions will appear here...</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
