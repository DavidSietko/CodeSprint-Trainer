'use server';

/**
 * @fileOverview Coding problem generator tailored to a job role and company.
 *
 * - generateCodingProblem - A function that generates a coding problem based on the provided job role and company.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateCodingProblemInput,
  GenerateCodingProblemInputSchema,
  GenerateCodingProblemOutput,
  GenerateCodingProblemOutputSchema,
} from '@/ai/schemas';

export async function generateCodingProblem(input: GenerateCodingProblemInput): Promise<GenerateCodingProblemOutput> {
  return generateCodingProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodingProblemPrompt',
  input: {schema: GenerateCodingProblemInputSchema},
  output: {schema: GenerateCodingProblemOutputSchema},
  prompt: `You are a coding problem generator that tailors problems to specific job roles and companies.

  Generate a coding problem that is appropriate for a candidate interviewing for the following job role at the following company.
  The problem should be suitable for the specified programming language and difficulty level.

  Job Role: {{{jobRole}}}
  Company: {{{company}}}
  Language: {{{language}}}
  Difficulty: {{{difficulty}}}

  The coding problem should be technically challenging but solvable within a reasonable timeframe (e.g., 45-60 minutes).
  Provide only the problem statement itself, without any introductory text like "Here is a problem...".
`,
});

const generateCodingProblemFlow = ai.defineFlow(
  {
    name: 'generateCodingProblemFlow',
    inputSchema: GenerateCodingProblemInputSchema,
    outputSchema: GenerateCodingProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
