'use server';

/**
 * @fileOverview Generates a summary of attendance trends for a given time frame and group of students.
 *
 * - generateAttendanceSummary - A function that generates the attendance summary.
 * - GenerateAttendanceSummaryInput - The input type for the generateAttendanceSummary function.
 * - GenerateAttendanceSummaryOutput - The return type for the generateAttendanceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAttendanceSummaryInputSchema = z.object({
  timeFrame: z.string().describe('The time frame for the attendance summary (e.g., last week, last month, last year).'),
  studentGroup: z.string().describe('The group of students to include in the summary (e.g., all students, specific class).'),
  additionalContext: z.string().optional().describe('Any additional context or information to consider when generating the summary.'),
});
export type GenerateAttendanceSummaryInput = z.infer<typeof GenerateAttendanceSummaryInputSchema>;

const GenerateAttendanceSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the attendance trends for the specified time frame and student group.'),
});
export type GenerateAttendanceSummaryOutput = z.infer<typeof GenerateAttendanceSummaryOutputSchema>;

export async function generateAttendanceSummary(input: GenerateAttendanceSummaryInput): Promise<GenerateAttendanceSummaryOutput> {
  return generateAttendanceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAttendanceSummaryPrompt',
  input: {
    schema: GenerateAttendanceSummaryInputSchema,
  },
  output: {
    schema: GenerateAttendanceSummaryOutputSchema,
  },
  prompt: `You are an AI assistant that summarizes attendance trends for a school.

  Summarize the attendance trends for the following time frame and student group. Consider any additional context provided.

  Time Frame: {{{timeFrame}}}
  Student Group: {{{studentGroup}}}
  Additional Context: {{{additionalContext}}}

  Provide a concise summary of the key attendance trends, including any patterns or areas of concern.`,
});

const generateAttendanceSummaryFlow = ai.defineFlow(
  {
    name: 'generateAttendanceSummaryFlow',
    inputSchema: GenerateAttendanceSummaryInputSchema,
    outputSchema: GenerateAttendanceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
