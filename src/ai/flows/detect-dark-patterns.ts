//detect-dark-patterns.ts
'use server';

/**
 * @fileOverview Detects dark patterns on a given URL.
 *
 * - detectDarkPatterns - A function that takes a URL and returns a list of detected dark patterns.
 * - DetectDarkPatternsInput - The input type for the detectDarkPatterns function.
 * - DetectDarkPatternsOutput - The return type for the detectDarkPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDarkPatternsInputSchema = z.object({
  url: z.string().describe('The URL of the webpage to analyze.'),
});
export type DetectDarkPatternsInput = z.infer<typeof DetectDarkPatternsInputSchema>;

const DarkPatternSchema = z.object({
  patternType: z.string().describe('The type of dark pattern detected.'),
  element: z.string().describe('The specific HTML element where the pattern is found.'),
  explanation: z.string().describe('An explanation of why this is considered a dark pattern.'),
});

const DetectDarkPatternsOutputSchema = z.array(DarkPatternSchema).describe('An array of detected dark patterns.');
export type DetectDarkPatternsOutput = z.infer<typeof DetectDarkPatternsOutputSchema>;

export async function detectDarkPatterns(input: DetectDarkPatternsInput): Promise<DetectDarkPatternsOutput> {
  return detectDarkPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDarkPatternsPrompt',
  input: {schema: DetectDarkPatternsInputSchema},
  output: {schema: DetectDarkPatternsOutputSchema},
  prompt: `You are an expert in identifying dark patterns on e-commerce websites.

  Analyze the webpage at the given URL for any dark patterns. Dark patterns are deceptive UI/UX interactions, designed to trick users into doing things they might not otherwise do.

  Return a JSON array of detected dark patterns. Each object in the array should have the following fields:
  - patternType: The type of dark pattern detected (e.g., fake scarcity, hidden costs).
  - element: The specific HTML element where the pattern is found (e.g., a specific button or text).
  - explanation: An explanation of why this is considered a dark pattern.

  URL: {{{url}}}
  `,
});

const detectDarkPatternsFlow = ai.defineFlow(
  {
    name: 'detectDarkPatternsFlow',
    inputSchema: DetectDarkPatternsInputSchema,
    outputSchema: DetectDarkPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
