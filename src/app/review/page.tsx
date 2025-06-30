
'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ArrowLeft, CheckCircle, Brain, Lightbulb, Star, BarChart2 } from 'lucide-react';
import Logo from '@/components/logo';

function ReviewDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const efficiency = searchParams.get('efficiency') || 'No feedback provided.';
  const correctness = searchParams.get('correctness') || 'No feedback provided.';
  const style = searchParams.get('style') || 'No feedback provided.';
  const score = searchParams.get('score');
  const insights = searchParams.get('insights') || '';
  
  const defaultOpen = ['efficiency', 'correctness', 'style'];
  if (insights) {
    defaultOpen.push('insights');
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
            <CardTitle className="text-3xl flex items-center gap-3"><CheckCircle className="text-accent"/>Solution Review</CardTitle>
            <CardDescription>Here's the feedback on your solution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Star className="text-primary"/>Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-6xl font-bold text-center text-primary">{score || 'N/A'}<span className="text-3xl text-muted-foreground">/10</span></p>
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
              <AccordionItem value="efficiency">
                <AccordionTrigger className="text-lg font-semibold flex items-center gap-2"><BarChart2 className="text-accent" />Efficiency Feedback</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">{efficiency}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="correctness">
                <AccordionTrigger className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-accent" />Correctness Feedback</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">{correctness}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="style">
                <AccordionTrigger className="text-lg font-semibold flex items-center gap-2"><Lightbulb className="text-accent" />Style Feedback</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed">{style}</AccordionContent>
              </AccordionItem>
              {insights && (
                 <AccordionItem value="insights">
                  <AccordionTrigger className="text-lg font-semibold flex items-center gap-2"><Brain className="text-accent" />Key Insights</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed">{insights}</AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading Review...</p>
          </div>
        }>
            <ReviewDashboard />
        </Suspense>
    )
}
