'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import type { GradeSolutionOutput } from '@/ai/schemas';
import { gradeSolutionAction } from '../actions';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/logo';

function AssessmentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  // Extract data from URL
  const jobRole = searchParams.get('jobRole') || '';
  const company = searchParams.get('company') || '';
  const problem = searchParams.get('problem') || '';
  const language = searchParams.get('language') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const code = searchParams.get('code') || '';
  const qna = searchParams.get('qna') || '';
  const questionsStr = searchParams.get('questions') || '[]';
  
  const questions = React.useMemo(() => {
    try {
      return JSON.parse(questionsStr);
    } catch (e) {
      return [];
    }
  }, [questionsStr]);

  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  React.useEffect(() => {
    if (!problem || questions.length !== 3) {
      // If we don't have the required data, go back to the start
      router.push('/');
    }
  }, [problem, questions, router]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  const allAnswersProvided = answers.every(answer => answer.trim() !== '');

  const handleGetReview = () => {
    setIsLoading(true);
    startTransition(async () => {
      const assessmentData = questions.map((q: string, i: number) => `Question: ${q}\nAnswer: ${answers[i]}`).join('\n\n');
      
      const result: GradeSolutionOutput = await gradeSolutionAction({
        problemDescription: problem,
        code: code,
        jobRole: jobRole,
        company: company,
        language: language,
        difficulty: difficulty,
        questionAndAnswers: qna,
        assessmentData: assessmentData,
      });

      if (result && result.overallScore) {
        const params = new URLSearchParams();
        params.set('efficiency', result.efficiencyFeedback);
        params.set('correctness', result.correctnessFeedback);
        params.set('style', result.styleFeedback);
        params.set('score', result.overallScore.toString());
        if (result.insights) {
          params.set('insights', result.insights);
        }
        router.push(`/review?${params.toString()}`);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to grade the solution. Please try again." });
        setIsLoading(false);
      }
    });
  };

  if (!problem || questions.length !== 3) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">CodeSprint Trainer</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Problem
        </Button>
      </header>
      
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl">Self-Assessment</CardTitle>
            <CardDescription>Answer these follow-up questions about your solution to complete the interview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              {questions.map((q: string, i: number) => (
                <div key={i} className="space-y-2">
                  <Label htmlFor={`answer-${i}`} className="text-base font-semibold">Question {i+1}: {q}</Label>
                  <Textarea
                    id={`answer-${i}`}
                    value={answers[i]}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    placeholder="Your answer..."
                    className="font-body h-28"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
            
            <Button onClick={handleGetReview} disabled={isLoading || !allAnswersProvided} className="w-full text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                 <Send className="mr-2 h-4 w-4" />
                  Submit & Get Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading Assessment...</p>
          </div>
        }>
            <AssessmentDashboard />
        </Suspense>
    )
}
