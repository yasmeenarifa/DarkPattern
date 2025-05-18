'use server';
/**
 * @fileOverview Summarizes product reviews to provide key pros and cons.
 *
 * - summarizeProductReviews - A function that summarizes product reviews.
 * - SummarizeProductReviewsInput - The input type for the summarizeProductReviews function.
 * - SummarizeProductReviewsOutput - The return type for the summarizeProductReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProductReviewsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  reviews: z.string().describe('The reviews of the product.'),
});
export type SummarizeProductReviewsInput = z.infer<typeof SummarizeProductReviewsInputSchema>;

const SummarizeProductReviewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the product reviews.'),
});
export type SummarizeProductReviewsOutput = z.infer<typeof SummarizeProductReviewsOutputSchema>;

export async function summarizeProductReviews(
  input: SummarizeProductReviewsInput
): Promise<SummarizeProductReviewsOutput> {
  return summarizeProductReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProductReviewsPrompt',
  input: {schema: SummarizeProductReviewsInputSchema},
  output: {schema: SummarizeProductReviewsOutputSchema},
  prompt: `Summarize the following product reviews for {{productName}}, highlighting the key pros and cons mentioned by users:\n\nReviews:\n{{{reviews}}}`,
});

const summarizeProductReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeProductReviewsFlow',
    inputSchema: SummarizeProductReviewsInputSchema,
    outputSchema: SummarizeProductReviewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
