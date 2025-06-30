'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/grade-solution.ts';
import '@/ai/flows/generate-coding-problem.ts';
import '@/ai/flows/answer-coding-question.ts';
import '@/ai/flows/provide-context-aware-hint.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-assessment-questions.ts';
