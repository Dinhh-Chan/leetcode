import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Upload, Settings, Maximize2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Editor from "@monaco-editor/react";
import { useLanguages } from "@/hooks/useLanguages";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  testCases?: { input: string; output: string }[];
}

const CodeEditor = ({ initialCode = "", language = "python", testCases = [] }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  
  const [activeTab, setActiveTab] = useState("testcase");
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);
  const { languages, isLoading: isLoadingLang } = useLanguages();
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card p-2">
        <div className="flex items-center gap-2">
          <Select value={selectedLangId?.toString() || undefined} onValueChange={(v) => setSelectedLangId(Number(v))}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder={isLoadingLang ? 'Loading...' : 'Select language'} />
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
            Auto
          </Button>
          <div className="ml-2 hidden md:flex gap-2">
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
        <ResizablePanel defaultSize={30} minSize={20} className="border-t bg-card p-3">
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
              {testCases.length > 0 ? (
                <>
                  <div className="mb-2">
                    <Tabs value={`tc-${selectedTestIdx}`} onValueChange={(v) => {
                      const idx = Number(String(v).replace('tc-',''));
                      if (!Number.isNaN(idx)) setSelectedTestIdx(idx);
                    }}>
                      <TabsList className="h-8 flex-wrap">
                        {testCases.map((_, i) => (
                          <TabsTrigger key={i} value={`tc-${i}`} className="text-xs">Testcase {i+1}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Input</div>
                      <pre className="kmark-pre overflow-auto rounded-md border p-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{testCases[selectedTestIdx]?.input || ''}</pre>
                    </div>
                    <div>
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Expected Output</div>
                      <pre className="kmark-pre overflow-auto rounded-md border p-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{testCases[selectedTestIdx]?.output || ''}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No testcases</div>
              )}
            </TabsContent>

            <TabsContent value="result" className="m-0 p-4">
              <div className="text-sm text-muted-foreground">
                Run your code to see results
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-card p-3">
        <div className="text-xs text-muted-foreground">Saved</div>
        <div className="flex gap-2 md:hidden">
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
