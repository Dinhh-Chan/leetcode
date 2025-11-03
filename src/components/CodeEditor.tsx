import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Upload, Settings, Maximize2, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Editor from "@monaco-editor/react";
import { useLanguages } from "@/hooks/useLanguages";
import * as monaco from "monaco-editor";
import { getPythonSuggestions } from "./CodeEditor/pythonSuggestions";
import { getCppSuggestions } from "./CodeEditor/cppSuggestions";
import { getCSharpSuggestions } from "./CodeEditor/csSuggestions";
import { judge0Service, BatchSubmissionResponse } from "@/services/judge0";
import { submissionsService } from "@/services/submissions";
import { contestSubmissionsService } from "@/services/contestSubmissions";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  testCases?: { input: string; output: string }[];
  problemId?: string;
  studentId?: string;
  contestId?: string;
  isContestSubmission?: boolean;
}

const CodeEditor = ({ initialCode = "", language = "python", testCases = [], problemId, studentId, contestId, isContestSubmission = false }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("testcase");
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const [selectedResultIdx, setSelectedResultIdx] = useState(0);
  const { languages, isLoading: isLoadingLang } = useLanguages();
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);
  const [results, setResults] = useState<BatchSubmissionResponse[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default select Python when languages are loaded
  if (!isLoadingLang && selectedLangId == null && languages.length) {
    const py = languages.find(l => /python\s*\(\s*3/i.test(l.name)) || languages.find(l => /python/i.test(l.name));
    if (py) {
      setSelectedLangId(py.id);
    }
  }

  const judge0NameToMonacoLang = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('python')) return 'python';
    if (n.includes('typescript')) return 'typescript';
    if (n.includes('javascript') || n.includes('node')) return 'javascript';
    if (n.includes('c++')) return 'cpp';
    if (n.match(/\bc\b/) && !n.includes('c++')) return 'c';
    if (n.includes('java')) return 'java';
    if (n.includes('c#') || n.includes('f#') || n.includes('.net')) return 'csharp';
    if (n.startsWith('go')) return 'go';
    if (n.includes('rust')) return 'rust';
    if (n.includes('kotlin')) return 'kotlin';
    if (n.includes('swift')) return 'swift';
    if (n.includes('php')) return 'php';
    if (n.includes('ruby')) return 'ruby';
    if (n.includes('scala')) return 'scala';
    if (n.startsWith('r ')) return 'r';
    return 'plaintext';
  };

  const editorLanguage = (() => {
    const langName = languages.find(l => l.id === selectedLangId)?.name;
    return langName ? judge0NameToMonacoLang(langName) : (language || 'plaintext');
  })();

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    // Cấu hình gợi ý cho Python
    if (editorLanguage === 'python') {
      monacoInstance.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          
          const suggestions = getPythonSuggestions(range, monacoInstance);
          
          return { suggestions };
        },
        triggerCharacters: ['.'],
      });
    }
    
    // Cấu hình gợi ý cho C++
    if (editorLanguage === 'cpp') {
      monacoInstance.languages.registerCompletionItemProvider('cpp', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          
          const suggestions = getCppSuggestions(range, monacoInstance);
          
          return { suggestions };
        },
        triggerCharacters: ['.'],
      });
    }
    
    // Cấu hình gợi ý cho C#
    if (editorLanguage === 'csharp') {
      monacoInstance.languages.registerCompletionItemProvider('csharp', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          
          const suggestions = getCSharpSuggestions(range, monacoInstance);
          
          return { suggestions };
        },
        triggerCharacters: ['.'],
      });
    }
  };

  const handleRun = async () => {
    if (!selectedLangId || !code.trim()) return;
    
    setIsRunning(true);
    try {
      // Bước 1: Submit và lấy tokens
      const submissions = testCases.map((testCase) => ({
        language_id: selectedLangId,
        source_code: code,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const tokenResponse = await judge0Service.submitBatch(submissions);
      const tokens = tokenResponse.map(t => t.token);
      
      // Bước 2: Polling để lấy kết quả
      const checkInterval = setInterval(async () => {
          try {
            const response = await judge0Service.getBatchResults(tokens);
            const allCompleted = response.submissions.every(
              s => s.status.id !== 1 && s.status.id !== 2
            );
            
            if (allCompleted) {
              clearInterval(checkInterval);
              setResults(response.submissions);
              setIsRunning(false);
            } else {
              // Vẫn đang queue hoặc processing, tiếp tục hiển thị status
              setResults(response.submissions);
            }
          } catch (error) {
            console.error("Error polling results:", error);
            clearInterval(checkInterval);
            setIsRunning(false);
          }
      }, 1000); // Poll mỗi 1 giây
      
      // Timeout sau 30 giây
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsRunning(false);
      }, 30000);
      
      setActiveTab("result");
      
      // Gọi ngay lần đầu để có status "In Queue"
      const initialResponse = await judge0Service.getBatchResults(tokens);
      setResults(initialResponse.submissions);
    } catch (error) {
      console.error("Error running code:", error);
      alert("Failed to run code. Please try again.");
      setIsRunning(false);
    }
  };

  const passedTests = results?.filter((r, idx) => {
    const isPassed = r.status.id === 3 && !r.stderr && r.stdout?.trim() === testCases[idx]?.output.trim();
    return isPassed;
  }).length || 0;

  const handleSubmit = async () => {
    if (!selectedLangId || !code.trim() || !problemId) {
      alert("Vui lòng đảm bảo đã chọn ngôn ngữ và điền code.");
      return;
    }

    if (isContestSubmission) {
      if (!contestId) {
        alert("Thiếu thông tin cuộc thi.");
        return;
      }
      
      setIsSubmitting(true);
      try {
        const response = await contestSubmissionsService.submit({
          contest_id: contestId,
          problem_id: problemId,
          language_id: selectedLangId,
          code: code.trim(),
        });
        
        // Navigate to contest submission detail page
        if (response.data._id) {
          navigate(`/contest/${contestId}/submissions/${response.data._id}`);
        }
      } catch (error: any) {
        console.error("Error submitting contest code:", error);
        alert(error?.message || "Không thể nộp bài. Vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!studentId) {
        alert("Thiếu thông tin người dùng.");
        return;
      }
      
      setIsSubmitting(true);
      try {
        const response = await submissionsService.submit({
          student_id: studentId,
          problem_id: problemId,
          language_id: selectedLangId,
          code: code.trim(),
        });
        
        // Navigate to submission detail page
        if (response.data._id) {
          navigate(`/submissions/${response.data._id}`);
        }
      } catch (error: any) {
        console.error("Error submitting code:", error);
        alert(error?.message || "Không thể nộp bài. Vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card p-2">
        <div className="flex items-center gap-2">
          <Select value={selectedLangId?.toString() || undefined} onValueChange={(v) => setSelectedLangId(Number(v))}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder={isLoadingLang ? 'Đang tải...' : 'Chọn ngôn ngữ'} />
            </SelectTrigger>
            <SelectContent>
              {(languages || []).map((lang) => (
                <SelectItem key={lang.id} value={String(lang.id)}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">
            Tự động
          </Button>
          <div className="ml-2 hidden md:flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleRun} disabled={isRunning}>
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Chạy
            </Button>
            <Button size="sm" className="gap-1 bg-success hover:bg-success/90" disabled={isRunning || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Nộp bài
            </Button>
          </div>
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

      {/* Editor + Bottom (Resizable Vertical) */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={40} className="overflow-hidden bg-muted/30 p-3">
          <Editor
            height="100%"
            language={editorLanguage}
            value={code}
            onChange={(val) => setCode(val || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: true, strings: true },
              snippetSuggestions: "inline",
              tabCompletion: "on",
              parameterHints: { enabled: true },
              wordBasedSuggestions: "allDocuments",
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} className="border-t bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-2">
              <TabsList className="h-9">
                <TabsTrigger value="testcase" className="text-xs">
                  Test case
                </TabsTrigger>
                <TabsTrigger value="result" className="text-xs">
                  Kết quả
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="testcase" className="m-0 flex-1 overflow-auto p-4">
              {testCases.length > 0 ? (
                <>
                  <div className="mb-2">
                    <Tabs value={`tc-${selectedTestIdx}`} onValueChange={(v) => {
                      const idx = Number(String(v).replace('tc-',''));
                      if (!Number.isNaN(idx)) setSelectedTestIdx(idx);
                    }}>
                      <TabsList className="h-8 flex-wrap">
                        {testCases.map((_, i) => (
                          <TabsTrigger key={i} value={`tc-${i}`} className="text-xs">Test case {i+1}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Đầu vào</div>
                      <pre className="kmark-pre overflow-auto rounded-md border p-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{testCases[selectedTestIdx]?.input || ''}</pre>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Đầu ra mong đợi</div>
                      <pre className="kmark-pre overflow-auto rounded-md border p-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{testCases[selectedTestIdx]?.output || ''}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No testcases</div>
              )}
            </TabsContent>

            <TabsContent value="result" className="m-0 flex-1 overflow-auto p-4">
              {results ? (
                <>
                  {isRunning && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang chạy code...
                      </p>
                    </div>
                  )}
                  {!isRunning && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold">
                        Kết quả: Đã đạt <span className="text-success">{passedTests}</span> trên {testCases.length} test case
                      </p>
                    </div>
                  )}
                  
                  {/* Tabs cho các test cases */}
                  <div className="mb-4">
                    <Tabs value={`result-${selectedResultIdx}`} onValueChange={(v) => {
                      const idx = Number(String(v).replace('result-', ''));
                      if (!Number.isNaN(idx)) setSelectedResultIdx(idx);
                    }}>
                      <TabsList className="h-8 flex-wrap">
                        {results.map((_, i) => {
                          const isPassed = _.status.id === 3 && 
                                          !_.stderr && 
                                          _.stdout?.trim() === testCases[i]?.output.trim();
                          const isQueued = _.status.id === 1;
                          const isProcessing = _.status.id === 2;
                          
                          let indicatorColor = "bg-destructive";
                          if (isQueued) indicatorColor = "bg-muted";
                          else if (isProcessing) indicatorColor = "bg-primary";
                          else if (isPassed) indicatorColor = "bg-success";
                          
                          return (
                            <TabsTrigger key={i} value={`result-${i}`} className="text-xs relative">
                              Test case {i+1}
                              <span className={`absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 rounded-full ${indicatorColor}`}></span>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Hiển thị result của test case được chọn */}
                  {results.map((result, idx) => {
                    if (idx !== selectedResultIdx) return null;
                    
                    const isPassed = result.status.id === 3 && 
                                    !result.stderr && 
                                    result.stdout?.trim() === testCases[idx]?.output.trim();
                    
                    const isQueued = result.status.id === 1;
                    const isProcessing = result.status.id === 2;
                    
                    let badgeColor = "bg-destructive";
                    let badgeText = "Failed";
                    
                    if (isQueued) {
                      badgeColor = "bg-muted";
                      badgeText = "In Queue";
                    } else if (isProcessing) {
                      badgeColor = "bg-primary";
                      badgeText = "Processing";
                    } else if (isPassed) {
                      badgeColor = "bg-success";
                      badgeText = "Passed";
                    }
                    
                    return (
                      <div key={idx} className="mb-4 rounded-md border p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium">Test case {idx + 1}</span>
                          <Badge className={badgeColor}>
                            {badgeText}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Đầu vào:</div>
                            <pre className="kmark-pre overflow-auto rounded border p-2 text-xs max-h-32" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                              {testCases[idx]?.input || ''}
                            </pre>
                          </div>
                          
                          <div>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Đầu ra mong đợi:</div>
                            <pre className="kmark-pre overflow-auto rounded border p-2 text-xs max-h-32" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                              {testCases[idx]?.output || ''}
                            </pre>
                          </div>
                          
                          <div>
                            <div className="mb-1 text-xs font-medium text-muted-foreground">Đầu ra thực tế:</div>
                            <pre className={`kmark-pre overflow-auto rounded border p-2 text-xs max-h-32 ${isPassed ? 'text-success' : 'text-destructive'}`} style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                              {result.stdout || '(không có đầu ra)'}
                            </pre>
                          </div>
                          
                          {result.stderr && (
                            <div>
                              <div className="mb-1 text-xs font-medium text-muted-foreground">Lỗi:</div>
                              <pre className="kmark-pre overflow-auto rounded border border-destructive p-2 text-xs text-destructive max-h-32" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                {result.stderr}
                              </pre>
                            </div>
                          )}
                          
                          {result.compile_output && (
                            <div>
                              <div className="mb-1 text-xs font-medium text-muted-foreground">Đầu ra biên dịch:</div>
                              <pre className="kmark-pre overflow-auto rounded border border-warning p-2 text-xs text-warning max-h-32" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                {result.compile_output}
                              </pre>
                            </div>
                          )}
                          
                          {result.message && (
                            <div>
                              <div className="mb-1 text-xs font-medium text-muted-foreground">Thông báo:</div>
                              <pre className="kmark-pre overflow-auto rounded border p-2 text-xs max-h-32" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                {result.message}
                              </pre>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Trạng thái: <span className="font-semibold">{result.status.description}</span></span>
                            <span>Thời gian: <span className="font-semibold">{result.time ? `${result.time}s` : '-'}</span></span>
                            <span>Bộ nhớ: <span className="font-semibold">{result.memory ? `${result.memory}KB` : '-'}</span></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
              <div className="text-sm text-muted-foreground">
                  Chạy code để xem kết quả
              </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-card p-3">
        <div className="text-xs text-muted-foreground">Đã lưu</div>
        <div className="flex gap-2 md:hidden">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleRun} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Chạy
          </Button>
          <Button size="sm" className="gap-1 bg-success hover:bg-success/90" disabled={isRunning || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Nộp bài
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
