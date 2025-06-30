'use server';

import {
  generateCodingProblem,
} from '@/ai/flows/generate-coding-problem';
import {
  provideContextAwareHint,
} from '@/ai/flows/provide-context-aware-hint';
import {
  answerCodingQuestion,
} from '@/ai/flows/answer-coding-question';
import {
  gradeSolution,
} from '@/ai/flows/grade-solution';
import {
  textToSpeech
} from '@/ai/flows/text-to-speech';
import {
  generateAssessmentQuestions,
} from '@/ai/flows/generate-assessment-questions';
import type { GenerateCodingProblemInput, GradeSolutionInput, GenerateAssessmentQuestionsInput } from '@/ai/schemas';


export async function generateCodingProblemAction(input: GenerateCodingProblemInput) {
  return await generateCodingProblem(input);
}

export async function provideContextAwareHintAction(input: { problemDescription: string, userCode: string }) {
  return await provideContextAwareHint({
    ...input,
    userQuestion: 'I am stuck, please provide a hint.'
  });
}

export async function answerCodingQuestionAction(input: { problemDescription: string, userCode: string, userQuestion: string }) {
  return await answerCodingQuestion(input);
}

export async function gradeSolutionAction(input: GradeSolutionInput) {
  return await gradeSolution(input);
}

export async function textToSpeechAction(input: string) {
    return await textToSpeech(input);
}

export async function generateAssessmentQuestionsAction(input: GenerateAssessmentQuestionsInput) {
  return await generateAssessmentQuestions(input);
}
