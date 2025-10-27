import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Upload, Settings, Maximize2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
}

const CodeEditor = ({ initialCode = "", language = "cpp" }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode || `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`);
  
  const [testCase, setTestCase] = useState("nums = [2,7,11,15]\ntarget = 9");
  const [activeTab, setActiveTab] = useState("testcase");

  const languages = [
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python3" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card p-2">
        <div className="flex items-center gap-2">
          <Select defaultValue={language}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">
            Auto
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div className="relative">
          <div className="absolute left-0 top-0 flex flex-col pr-4 text-right text-xs text-muted-foreground">
            {code.split('\n').map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[300px] resize-none border-0 bg-transparent pl-12 font-mono text-sm leading-6 focus-visible:ring-0"
            spellCheck={false}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Ln 1, Col 1
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="border-t bg-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between border-b px-2">
            <TabsList className="h-9">
              <TabsTrigger value="testcase" className="text-xs">
                Testcase
              </TabsTrigger>
              <TabsTrigger value="result" className="text-xs">
                Test Result
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="testcase" className="m-0 p-4">
            <Textarea
              value={testCase}
              onChange={(e) => setTestCase(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
              placeholder="Enter test case..."
            />
          </TabsContent>
          
          <TabsContent value="result" className="m-0 p-4">
            <div className="text-sm text-muted-foreground">
              Run your code to see results
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t bg-card p-3">
        <div className="text-xs text-muted-foreground">Saved</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Play className="h-4 w-4" />
            Run
          </Button>
          <Button size="sm" className="gap-1 bg-success hover:bg-success/90">
            <Upload className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
