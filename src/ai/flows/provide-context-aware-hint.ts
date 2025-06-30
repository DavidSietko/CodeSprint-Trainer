'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing context-aware hints for a coding problem.
 *
 * - provideContextAwareHint - A function that provides a hint for a coding problem.
 */

import {ai} from '@/ai/genkit';
import {
  ProvideContextAwareHintInput,
  ProvideContextAwareHintInputSchema,
  ProvideContextAwareHintOutput,
  ProvideContextAwareHintOutputSchema,
} from '@/ai/schemas';

export async function provideContextAwareHint(input: ProvideContextAwareHintInput): Promise<ProvideContextAwareHintOutput> {
  return provideContextAwareHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideContextAwareHintPrompt',
  input: {schema: ProvideContextAwareHintInputSchema},
  output: {schema: ProvideContextAwareHintOutputSchema},
  prompt: `You are an expert coding tutor. A student is working on the following problem:

Problem Description: {{{problemDescription}}}

The student has written the following code:

User Code: {{{userCode}}}

The student has the following specific question:

User Question: {{{userQuestion}}}

Provide a context-aware hint to guide the student without giving away the solution. The hint should be specific to the student's code and question. Focus on helping them debug or improve their current approach. Do not include any code in the response. Be concise.`,
});

const provideContextAwareHintFlow = ai.defineFlow(
  {
    name: 'provideContextAwareHintFlow',
    inputSchema: ProvideContextAwareHintInputSchema,
    outputSchema: ProvideContextAwareHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
