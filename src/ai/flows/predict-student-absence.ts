'use server';

/**
 * @fileOverview AI flow to predict student absence based on historical attendance data.
 *
 * - predictStudentAbsence - Predicts whether a student will be absent.
 * - PredictStudentAbsenceInput - The input type for predictStudentAbsence function.
 * - PredictStudentAbsenceOutput - The output type for predictStudentAbsence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictStudentAbsenceInputSchema = z.object({
  studentId: z.string().describe('The unique identifier of the student.'),
  historicalAttendanceData: z.string().describe('Historical attendance data of the student in JSON format.'),
  currentClassSchedule: z.string().describe('The current class schedule of the student in JSON format.'),
});
export type PredictStudentAbsenceInput = z.infer<typeof PredictStudentAbsenceInputSchema>;

const PredictStudentAbsenceOutputSchema = z.object({
  willBeAbsent: z.boolean().describe('Whether the student is predicted to be absent.'),
  reason: z.string().describe('The reason for the predicted absence.'),
  confidenceScore: z.number().describe('A score between 0 and 1 indicating the confidence level of the prediction.'),
});
export type PredictStudentAbsenceOutput = z.infer<typeof PredictStudentAbsenceOutputSchema>;

export async function predictStudentAbsence(input: PredictStudentAbsenceInput): Promise<PredictStudentAbsenceOutput> {
  return predictStudentAbsenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictStudentAbsencePrompt',
  input: {
    schema: PredictStudentAbsenceInputSchema,
  },
  output: {
    schema: PredictStudentAbsenceOutputSchema,
  },
  prompt: `You are an AI attendance prediction system.
  You will receive studentId, historical attendance data, and current class schedule to predict the absence of student. You will also output the reason for the predicted absence and the confidence score for that.

  Student ID: {{{studentId}}}
  Historical Attendance Data: {{{historicalAttendanceData}}}
  Current Courses: {{{currentClassSchedule}}}

  Based on the information provided, predict if the student will be absent and provide a reason and confidence score. Follow the output schema. Return a JSON object.
  `,
});

const predictStudentAbsenceFlow = ai.defineFlow(
  {
    name: 'predictStudentAbsenceFlow',
    inputSchema: PredictStudentAbsenceInputSchema,
    outputSchema: PredictStudentAbsenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
