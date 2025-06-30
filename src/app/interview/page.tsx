'use client';

import React, { useState, useTransition, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, BrainCircuit, BotMessageSquare, Lightbulb, ArrowLeft, Timer, Mic, PlayCircle, FileText, Send, CheckCircle } from 'lucide-react';
import { provideContextAwareHintAction, answerCodingQuestionAction, generateAssessmentQuestionsAction, textToSpeechAction } from '../actions';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CodeEditor } from '@/components/code-editor';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type QnaPair = { question: string; answer: string; audioUrl?: string; };

const getDefaultCode = (language: string) => {
    switch (language.toLowerCase()) {
      case "javascript":
        return `// Write your JavaScript solution here\nfunction solution() {\n    // Your code here\n}`;
      case "python":
        return `# Write your Python solution here\ndef solution():\n    # Your code here\n    pass`;
      case "java":
        return `// Write your Java solution here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;
      case "c++":
        return `// Write your C++ solution here\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}`;
      case "typescript":
        return `// Write your TypeScript solution here\nfunction solution(): any {\n    // Your code here\n}`;
      case "c":
        return `// Write your C solution here\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`;
      case "csharp":
        return `// Write your C# solution here\nusing System;\n\nclass Program {\n    static void Main() {\n        // Your code here\n    }\n}`;
      default:
        return "// Write your solution here";
    }
  };

  const getMonacoLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'c++') return 'cpp';
    if (l === 'csharp') return 'csharp';
    return l;
  }

function InterviewDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const jobRole = searchParams.get('jobRole') || '';
  const company = searchParams.get('company') || '';
  const problem = searchParams.get('problem') || '';
  const language = searchParams.get('language') || 'javascript';
  const difficulty = searchParams.get('difficulty') || 'Not specified';
  const timeLimit = parseInt(searchParams.get('timeLimit') || '0', 10);

  const [phase, setPhase] = useState<'discussion' | 'coding'>('discussion');
  const [hasDiscussed, setHasDiscussed] = useState(false);

  const [code, setCode] = useState(() => getDefaultCode(language));
  const [hint, setHint] = useState('');
  const [qnaHistory, setQnaHistory] = useState<QnaPair[]>([]);
  
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Code execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState("");
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!problem) {
      router.push('/');
    }
  }, [problem, router]);

  React.useEffect(() => {
    if (timeLimit === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          setIsTimeUp(true);
          toast({
            variant: "destructive",
            title: "Time's Up!",
            description: "The timer has run out. You can no longer edit your code or ask for hints.",
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLimit, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleGetHint = () => {
    setIsLoadingHint(true);
    setHint('');
    startTransition(async () => {
      const result = await provideContextAwareHintAction({ problemDescription: problem, userCode: code });
      if (result.hint) {
        setHint(result.hint);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to get a hint. Please try again." });
      }
      setIsLoadingHint(false);
    });
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;
    setIsAskingQuestion(true);

    const question = currentQuestion;
    setCurrentQuestion("");

    startTransition(async () => {
      const textResult = await answerCodingQuestionAction({
        problemDescription: problem,
        userCode: code,
        userQuestion: question,
      });

      if (textResult.answer) {
        const newQna: QnaPair = { question: question, answer: textResult.answer };
        setQnaHistory(prev => [...prev, newQna]);
        if (phase === 'discussion') setHasDiscussed(true);
        
        const audioResult = await textToSpeechAction(textResult.answer);
        if (audioResult.media) {
            setQnaHistory(prev => prev.map(q => q === newQna ? {...q, audioUrl: audioResult.media} : q));
        }

      } else {
         toast({ variant: "destructive", title: "Error", description: "Failed to get an answer. Please try again." });
         setCurrentQuestion(question);
      }
      setIsAskingQuestion(false);
    });
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
    }
  }

  // --- Code Execution Logic ---
  const executeJavaScript = (code: string) => {
    try {
      const originalLog = console.log;
      let output = "";
      console.log = (...args) => {
        output += args.map((arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)).join(" ") + "\n";
      };
      const result = eval(code);
      console.log = originalLog;
      if (result !== undefined && output === "") {
        output = String(result);
      }
      return output || "Code executed successfully (no output)";
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  };

  const getPistonLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'c++') return 'cpp';
    if (l === 'typescript') return 'typescript';
    if (l === 'javascript') return 'javascript';
    if (l === 'python') return 'python';
    if (l === 'java') return 'java';
    if (l === 'c') return 'c';
    if (l === 'csharp') return 'csharp';
    return lang;
  };
  
  const getFileName = (lang: string) => {
      const l = lang.toLowerCase();
      if (l === 'python') return 'main.py';
      if (l === 'java') return 'Main.java';
      if (l === 'c++') return 'main.cpp';
      if (l === 'javascript') return 'main.js';
      if (l === 'typescript') return 'main.ts';
      if (l === 'c') return 'main.c';
      if (l === 'csharp') return 'main.cs';
      return 'main.txt';
  };

  const executeWithPiston = async (code: string, language: string, input: string = "") => {
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: getPistonLanguage(language),
          version: "*",
          files: [{ name: getFileName(language), content: code }],
          stdin: input,
        }),
      });
      const result = await response.json();
      if (result.run) {
        if (result.run.stdout) return result.run.stdout;
        if (result.run.stderr) return `Error: ${result.run.stderr}`;
        return "Code executed successfully (no output)";
      } else if (result.compile && result.compile.stderr) {
        return `Compilation Error: ${result.compile.stderr}`;
      } else {
        return "Code executed successfully (no output)";
      }
    } catch (error) {
      return `Execution Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setExecutionResult("No code to execute");
      setShowResultDialog(true);
      return;
    }
    setIsRunning(true);
    setExecutionResult("Running...");
    setShowResultDialog(true);
    try {
      let result;
      if (language.toLowerCase() === "javascript") {
        result = executeJavaScript(code);
      } else {
        result = await executeWithPiston(code, language, customInput);
      }
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };
  // --- End Code Execution ---


  const handleStartAssessment = () => {
    setIsGeneratingQuestions(true);
    startTransition(async () => {
      const result = await generateAssessmentQuestionsAction({
          problemDescription: problem,
          userCode: code,
      });

      if (result && result.questions) {
        const qnaString = qnaHistory.map(qna => `User Question: ${qna.question}\nAI Answer: ${qna.answer}`).join('\n\n');
        
        const params = new URLSearchParams({
            jobRole,
            company,
            language,
            difficulty,
            problem,
            code,
            qna: qnaString,
            questions: JSON.stringify(result.questions)
        });
        router.push(`/assessment?${params.toString()}`);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to generate assessment questions. Please try again." });
        setIsGeneratingQuestions(false);
      }
    });
  };

  if (!problem) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <audio ref={audioRef} className="hidden"/>
      <header className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">CodeSprint Trainer</h1>
        </div>
        <div className="flex items-center gap-4">
          {timeLimit > 0 && (
            <div className="flex items-center gap-2 font-mono text-lg p-2 bg-secondary rounded-md">
                <Timer className="h-5 w-5 text-primary" />
                <span>{formatTime(timeLeft)}</span>
            </div>
          )}
          <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Problem
          </Button>
        </div>
      </header>
      
      <main className="p-4 md:p-8">
        {phase === 'discussion' ? (
             <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-md flex flex-col h-[calc(100vh-250px)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-accent" />Problem Description</CardTitle>
                            <CardDescription>For a <strong>{jobRole}</strong> role at <strong>{company}</strong>. Difficulty: <strong className="capitalize">{difficulty}</strong>.</CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none dark:prose-invert flex-1 overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem}</ReactMarkdown>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md flex flex-col h-[calc(100vh-250px)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BotMessageSquare className="text-accent"/>Discuss Your Approach</CardTitle>
                            <CardDescription>Before coding, outline your plan to the AI. This is a common interview step. Explain your initial thoughts, data structures you might use, and the overall algorithm.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 min-h-0">
                            <form onSubmit={handleAskQuestion} className="space-y-4">
                                <Textarea
                                    value={currentQuestion}
                                    onChange={(e) => setCurrentQuestion(e.target.value)}
                                    placeholder="e.g., I think I can solve this using a hash map to store frequencies..."
                                    className="font-body h-28"
                                    disabled={isAskingQuestion}
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isAskingQuestion || !currentQuestion} className="w-full">
                                        {isAskingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Send className="mr-2 h-4 w-4" /> Discuss
                                    </Button>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" variant="outline" size="icon" disabled>
                                                    <Mic />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Voice input coming soon!</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </form>
                            {qnaHistory.length > 0 && (
                                <div className="mt-4 space-y-4 p-2 border-t flex-1 overflow-y-auto">
                                    {qnaHistory.slice().reverse().map((qna, index) => (
                                      <div key={index}>
                                        <p className="font-semibold text-sm">You: <span className="font-normal">{qna.question}</span></p>
                                        <div className="p-2 mt-1 bg-secondary rounded-md text-sm flex items-start gap-2">
                                          <p className="flex-1">AI: {qna.answer}</p>
                                          {qna.audioUrl ? (
                                            <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" onClick={() => playAudio(qna.audioUrl!)}>
                                                <PlayCircle className="h-4 w-4" />
                                            </Button>
                                          ) : (
                                            isAskingQuestion && <Loader2 className="h-4 w-4 animate-spin" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8 flex justify-center">
                    <Button onClick={() => setPhase('coding')} disabled={!hasDiscussed || isAskingQuestion} className="w-full max-w-lg text-lg py-6">
                       <CheckCircle className="mr-2 h-5 w-5" /> Proceed to Coding
                    </Button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="flex flex-col gap-8 max-h-[calc(100vh-150px)] overflow-hidden">
                <Card className="shadow-md flex-1 flex flex-col min-h-0">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-accent" />Problem & AI Assistant</CardTitle>
                      <CardDescription>For a <strong>{jobRole}</strong> role at <strong>{company}</strong>. Difficulty: <strong className="capitalize">{difficulty}</strong>.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                    <Tabs defaultValue="problem" className="h-full flex flex-col flex-1">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="problem">Problem</TabsTrigger>
                        <TabsTrigger value="assistant">AI Help</TabsTrigger>
                      </TabsList>
                      <TabsContent value="problem" className="flex-1 mt-4 overflow-auto">
                         <div className="prose prose-sm max-w-none dark:prose-invert">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem}</ReactMarkdown>
                         </div>
                      </TabsContent>
                      <TabsContent value="assistant" className="flex-1 mt-4 overflow-auto">
                        <Tabs defaultValue="hint" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="hint" disabled={isTimeUp}>Get a Hint</TabsTrigger>
                                <TabsTrigger value="qa" disabled={isTimeUp}>Ask a Question</TabsTrigger>
                            </TabsList>
                            <TabsContent value="hint" className="flex-1 mt-4">
                                <Button onClick={handleGetHint} disabled={isLoadingHint || isTimeUp} className="w-full">
                                    {isLoadingHint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4"/>} Request Hint
                                </Button>
                                {hint && <p className="mt-4 p-4 bg-secondary rounded-md text-sm">{hint}</p>}
                            </TabsContent>
                            <TabsContent value="qa" className="flex-1 mt-4 flex flex-col">
                                <form onSubmit={handleAskQuestion} className="space-y-4">
                                    <Textarea value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} placeholder="Ask a specific question..." className="font-body h-24" disabled={isTimeUp || isAskingQuestion} />
                                    <Button type="submit" disabled={isAskingQuestion || !currentQuestion || isTimeUp} className="w-full">
                                        {isAskingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Question
                                    </Button>
                                </form>
                                {qnaHistory.length > 0 && (
                                <div className="mt-4 space-y-4 flex-1 overflow-y-auto p-2">
                                    {qnaHistory.slice().reverse().map((qna, index) => (
                                    <div key={index}>
                                        <p className="font-semibold text-sm">You: <span className="font-normal">{qna.question}</span></p>
                                        <div className="p-2 mt-1 bg-secondary rounded-md text-sm flex items-start gap-2">
                                            <p className="flex-1">AI: {qna.answer}</p>
                                            {qna.audioUrl && (
                                                <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" onClick={() => playAudio(qna.audioUrl!)}>
                                                    <PlayCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                )}
                            </TabsContent>
                        </Tabs>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-8">
                <Card className="shadow-md flex flex-col" style={{ minHeight: "500px", backgroundColor: "var(--background)" }}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Code Editor</CardTitle>
                                <CardDescription>Language: <span className="capitalize">{language}</span></CardDescription>
                            </div>
                             <Button size="sm" disabled={isTimeUp || isRunning} onClick={handleRunCode}>
                                {isRunning ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : "▶"}
                                {isRunning ? "Running..." : "Run Code"}
                             </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <CodeEditor
                            language={getMonacoLanguage(language)}
                            code={code}
                            onCodeChange={setCode}
                            disabled={isTimeUp}
                        />
                    </CardContent>
                </Card>
                <Button onClick={handleStartAssessment} disabled={isGeneratingQuestions || !code || isTimeUp} className="w-full text-lg py-6">
                    {isGeneratingQuestions ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Questions...</>
                    ) : (
                        <><FileText className="mr-2 h-4 w-4" />Finish & Start Assessment</>
                    )}
                </Button>
              </div>
            </div>
        )}
      </main>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Execution Results</DialogTitle></DialogHeader>
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            {language.toLowerCase() !== "javascript" && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Custom Input (stdin):</label>
                <Textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Enter input for your program (optional)" className="h-20 font-mono text-sm" disabled={isRunning} />
              </div>
            )}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Output:</label>
              <div className="bg-muted/50 border rounded-md p-4 flex-1 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground">{executionResult}</pre>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setShowResultDialog(false)}>Close</Button>
              <Button onClick={handleRunCode} disabled={isRunning || !code.trim()}>
                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "▶"}
                {isRunning ? "Running..." : "Run Again"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Since useSearchParams() is a client-side hook, we need to wrap the page in a Suspense boundary.
// This is a requirement for Next.js App Router.
export default function InterviewPage() {
    return (
        <Suspense fallback={
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading Interview...</p>
          </div>
        }>
            <InterviewDashboard />
        </Suspense>
    )
}
