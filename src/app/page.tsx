'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Timer } from 'lucide-react';
import { generateCodingProblemAction } from './actions';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/logo';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleInputSchema = z.object({
  jobRole: z.string().min(2, { message: 'Job role must be at least 2 characters.' }),
  company: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  language: z.string({ required_error: 'Please select a language.' }),
  difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: 'Please select a difficulty.' }),
  timeLimit: z.string({ required_error: 'Please select a time limit.' }),
});

const timeOptions = [
  { value: '0', label: 'No limit' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String((i + 1) * 15),
    label: `${(i + 1) * 15} minutes`,
  })),
];

const JOB_ROLE_KEY = 'codesprint_jobRole';
const COMPANY_KEY = 'codesprint_company';
const LANGUAGE_KEY = 'codesprint_language';

export default function ChooseProblemPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);

  const form = useForm<z.infer<typeof roleInputSchema>>({
    resolver: zodResolver(roleInputSchema),
    defaultValues: {
      jobRole: '',
      company: '',
      language: undefined,
      difficulty: 'medium',
      timeLimit: '60'
    },
  });

  useEffect(() => {
    const storedJobRole = localStorage.getItem(JOB_ROLE_KEY);
    const storedCompany = localStorage.getItem(COMPANY_KEY);
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);

    if (storedJobRole) form.setValue('jobRole', storedJobRole);
    if (storedCompany) form.setValue('company', storedCompany);
    if (storedLanguage) form.setValue('language', storedLanguage);
  }, [form]);

  const handleGenerateProblem = (values: z.infer<typeof roleInputSchema>) => {
    setIsLoadingProblem(true);

    localStorage.setItem(JOB_ROLE_KEY, values.jobRole);
    localStorage.setItem(COMPANY_KEY, values.company);
    localStorage.setItem(LANGUAGE_KEY, values.language);

    startTransition(async () => {
      const result = await generateCodingProblemAction(values);
      if (result.problemStatement) {
        const params = new URLSearchParams({
          jobRole: values.jobRole,
          company: values.company,
          language: values.language,
          difficulty: values.difficulty,
          problem: result.problemStatement,
          timeLimit: values.timeLimit,
        });
        router.push(`/interview?${params.toString()}`);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to generate a problem. Please try again." });
        setIsLoadingProblem(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center">
        <header className="absolute top-0 left-0 p-4 border-b border-border flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-primary">CodeSprint Trainer</h1>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">Your AI-powered interview prep partner</p>
        </header>
      
      <main className="p-4 md:p-8 w-full max-w-2xl">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" />Set Your Goal</CardTitle>
            <CardDescription>Tailor the coding problem to your target job, company, language, and difficulty.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateProblem)} className="space-y-6">
                <FormField control={form.control} name="jobRole" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormControl><Input placeholder="e.g., Senior Software Engineer" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="c++">C++</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Difficulty</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="easy" /></FormControl>
                            <FormLabel className="font-normal">Easy</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="medium" /></FormControl>
                            <FormLabel className="font-normal">Medium</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="hard" /></FormControl>
                            <FormLabel className="font-normal">Hard</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" />Time Limit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time limit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoadingProblem} className="w-full">
                    {isLoadingProblem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Problem
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
