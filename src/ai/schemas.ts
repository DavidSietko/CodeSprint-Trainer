import {z} from 'genkit';

// From generate-coding-problem.ts
export const GenerateCodingProblemInputSchema = z.object({
  jobRole: z.string().describe('The job role for which to tailor the coding problem.'),
  company: z.string().describe('The company for which to tailor the coding problem.'),
  language: z.string().describe('The programming language for the coding problem.'),
  difficulty: z.string().describe('The difficulty level for the coding problem (e.g., Easy, Medium, Hard).'),
});
export type GenerateCodingProblemInput = z.infer<typeof GenerateCodingProblemInputSchema>;

export const GenerateCodingProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The generated coding problem statement.'),
});
export type GenerateCodingProblemOutput = z.infer<typeof GenerateCodingProblemOutputSchema>;


// From grade-solution.ts
export const GradeSolutionInputSchema = z.object({
  code: z.string().describe('The code solution to be graded.'),
  problemDescription: z.string().describe('The description of the coding problem.'),
  jobRole: z.string().optional().describe('The job role the user is practicing for.'),
  company: z.string().optional().describe('The company the user is practicing for.'),
  language: z.string().optional().describe('The programming language for the coding problem.'),
  difficulty: z.string().optional().describe('The difficulty level of the coding problem.'),
  questionAndAnswers: z.string().optional().describe('Questions and answers between user and AI during the initial discussion phase.'),
  assessmentData: z.string().optional().describe("Follow-up questions asked to the user about their code, and the answers they provided."),
});
export type GradeSolutionInput = z.infer<typeof GradeSolutionInputSchema>;

export const GradeSolutionOutputSchema = z.object({
  efficiencyFeedback: z.string().describe('Feedback on the efficiency of the code.'),
  correctnessFeedback: z.string().describe('Feedback on the correctness of the code.'),
  styleFeedback: z.string().describe('Feedback on the style of the code.'),
  overallScore: z.number().min(1).max(10).describe('A numerical score from 1 to 10 evaluating the overall quality of the solution.'),
  insights: z.string().optional().describe('Key insights of the approach used.'),
});
export type GradeSolutionOutput = z.infer<typeof GradeSolutionOutputSchema>;


// From answer-coding-question.ts
export const AnswerCodingQuestionInputSchema = z.object({
  problemDescription: z.string().describe('The description of the coding problem.'),
  userQuestion: z.string().describe('The user question about the coding problem.'),
  userCode: z.string().describe('The user code'),
});
export type AnswerCodingQuestionInput = z.infer<typeof AnswerCodingQuestionInputSchema>;

export const AnswerCodingQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the coding problem.'),
});
export type AnswerCodingQuestionOutput = z.infer<typeof AnswerCodingQuestionOutputSchema>;


// From provide-context-aware-hint.ts
export const ProvideContextAwareHintInputSchema = z.object({
  problemDescription: z.string().describe('The description of the coding problem.'),
  userCode: z.string().describe('The user\'s current code solution.'),
  userQuestion: z.string().describe('The user\'s specific question about their approach.'),
});
export type ProvideContextAwareHintInput = z.infer<typeof ProvideContextAwareHintInputSchema>;

export const ProvideContextAwareHintOutputSchema = z.object({
  hint: z.string().describe('A context-aware hint to guide the user without giving away the solution.'),
});
export type ProvideContextAwareHintOutput = z.infer<typeof ProvideContextAwareHintOutputSchema>;


// From text-to-speech.ts
export const TextToSpeechInputSchema = z.string();
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  media: z.string().describe("The audio data as a base64-encoded WAV data URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


// From generate-assessment-questions.ts
export const GenerateAssessmentQuestionsInputSchema = z.object({
  problemDescription: z.string().describe('The description of the coding problem.'),
  userCode: z.string().describe("The user's code solution."),
});
export type GenerateAssessmentQuestionsInput = z.infer<typeof GenerateAssessmentQuestionsInputSchema>;

export const GenerateAssessmentQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).length(3).describe('An array of exactly three questions about the user\'s code.'),
});
export type GenerateAssessmentQuestionsOutput = z.infer<typeof GenerateAssessmentQuestionsOutputSchema>;
