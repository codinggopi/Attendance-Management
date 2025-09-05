import { config } from 'dotenv';
config();

import '@/ai/flows/predict-student-absence.ts';
import '@/ai/flows/generate-attendance-summary.ts';