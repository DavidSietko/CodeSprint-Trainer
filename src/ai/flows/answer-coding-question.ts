'use server';
/**
 * @fileOverview A flow that answers a user's specific question about a coding problem.
 *
 * - answerCodingQuestion - A function that answers a coding question.
 */

import {ai} from '@/ai/genkit';
import {
  AnswerCodingQuestionInput,
  AnswerCodingQuestionInputSchema,
  AnswerCodingQuestionOutput,
  AnswerCodingQuestionOutputSchema,
} from '@/ai/schemas';

export async function answerCodingQuestion(input: AnswerCodingQuestionInput): Promise<AnswerCodingQuestionOutput> {
  return answerCodingQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCodingQuestionPrompt',
  input: {schema: AnswerCodingQuestionInputSchema},
  output: {schema: AnswerCodingQuestionOutputSchema},
  prompt: `You are an expert coding tutor acting as an interviewer.

You are conducting a mock coding interview. The candidate is in the initial discussion phase, where they are expected to explain their approach before writing code. Your goal is to guide the candidate towards a good solution without giving away the answer.

Based on the following problem:
Problem: {{{problemDescription}}}

The candidate's proposed approach is:
Approach: {{{userQuestion}}}

The candidate may have also started some preliminary code:
Code: {{{userCode}}}

Please provide feedback on their approach.
- If the approach is sound, affirm it and gently prompt them to consider edge cases, alternative data structures, or performance implications.
- If the approach has flaws, ask probing questions to help them identify the issues on their own (e.g., "Have you considered what happens if the input is empty?" or "What is the time complexity of that step?").
- Do not provide the correct code or the direct solution. Your role is to guide, not to give answers.
- Be encouraging and constructive. Keep your response concise.
  `,
});

const answerCodingQuestionFlow = ai.defineFlow(
  {
    name: 'answerCodingQuestionFlow',
    inputSchema: AnswerCodingQuestionInputSchema,
    outputSchema: AnswerCodingQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
