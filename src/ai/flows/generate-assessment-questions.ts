'use server';
/**
 * @fileOverview A flow to generate follow-up questions about a user's code solution.
 *
 * - generateAssessmentQuestions - Generates 3 questions based on the problem and the user's code.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateAssessmentQuestionsInput,
  GenerateAssessmentQuestionsInputSchema,
  GenerateAssessmentQuestionsOutput,
  GenerateAssessmentQuestionsOutputSchema,
} from '@/ai/schemas';

export async function generateAssessmentQuestions(input: GenerateAssessmentQuestionsInput): Promise<GenerateAssessmentQuestionsOutput> {
  return generateAssessmentQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentQuestionsPrompt',
  input: {schema: GenerateAssessmentQuestionsInputSchema},
  output: {schema: GenerateAssessmentQuestionsOutputSchema},
  prompt: `You are an expert software engineer conducting a coding interview. You need to evaluate a candidate's understanding of their own solution.

Problem Description:
{{{problemDescription}}}

Candidate's Code Solution:
{{{userCode}}}

Based on their specific code, generate three insightful follow-up questions. These questions should probe their knowledge of:
1.  Time and space complexity (Big O notation).
2.  Potential edge cases or failure points in their logic.
3.  Alternative approaches, different data structures, or trade-offs they considered.

The questions must be directly related to the provided code. Do not ask generic questions.
Return exactly three questions.
  `,
});

const generateAssessmentQuestionsFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionsFlow',
    inputSchema: GenerateAssessmentQuestionsInputSchema,
    outputSchema: GenerateAssessmentQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
