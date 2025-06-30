'use server';
/**
 * @fileOverview A code solution grading AI agent.
 *
 * - gradeSolution - A function that handles the code grading process.
 */

import {ai} from '@/ai/genkit';
import {
  GradeSolutionInput,
  GradeSolutionInputSchema,
  GradeSolutionOutput,
  GradeSolutionOutputSchema,
} from '@/ai/schemas';


export async function gradeSolution(input: GradeSolutionInput): Promise<GradeSolutionOutput> {
  return gradeSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeSolutionPrompt',
  input: {schema: GradeSolutionInputSchema},
  output: {schema: GradeSolutionOutputSchema},
  prompt: `You are an expert software engineer specializing in code review and grading.

You will use all the following information to grade the code solution, and provide feedback on its efficiency, correctness, and style. You will also provide an overall score out of 10.

Problem Description: {{{problemDescription}}}
Code Solution:
\`\`\`{{language}}
{{{code}}}
\`\`\`
Job Role: {{jobRole}}
Company: {{company}}
Difficulty: {{difficulty}}

The candidate had an initial discussion about their approach. Here is the transcript:
Initial Discussion:
{{{questionAndAnswers}}}

After writing the code, the candidate was asked the following questions about their solution. Their answers are provided.
Your grading should be heavily influenced by their responses, as it reveals their depth of understanding.

Assessment Questions & Answers:
{{{assessmentData}}}

Based on all the information above (the code, the discussion, and the assessment answers), provide your evaluation.

Provide feedback in a concise and constructive manner. The overall score should be a single number between 1 and 10. Provide some key insights about the user's approach.

Efficiency Feedback:
Correctness Feedback:
Style Feedback:
Overall Score:
Insights:
`,
});

const gradeSolutionFlow = ai.defineFlow(
  {
    name: 'gradeSolutionFlow',
    inputSchema: GradeSolutionInputSchema,
    outputSchema: GradeSolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
