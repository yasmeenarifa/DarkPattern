
'use server';
/**
 * @fileOverview Detects tricky offers on a given URL.
 *
 * - detectTrickyOffers - A function that takes a URL and returns a list of detected tricky offers.
 * - DetectTrickyOffersInput - The input type for the detectTrickyOffers function.
 * - DetectTrickyOffersOutput - The return type for the detectTrickyOffers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrickyOffersInputSchema = z.object({
  url: z.string().describe('The URL of the webpage to analyze for tricky offers.'),
});
export type DetectTrickyOffersInput = z.infer<typeof DetectTrickyOffersInputSchema>;

const TrickyOfferSchema = z.object({
  offerText: z.string().describe('The verbatim text of the offer as seen on the page.'),
  concern: z.string().describe('Why this offer is potentially tricky or misleading.'),
  advice: z.string().describe('Advice to the user on how to approach this offer cautiously.'),
});

const DetectTrickyOffersOutputSchema = z.array(TrickyOfferSchema).describe('An array of detected tricky offers.');
export type DetectTrickyOffersOutput = z.infer<typeof DetectTrickyOffersOutputSchema>;

export async function detectTrickyOffers(input: DetectTrickyOffersInput): Promise<DetectTrickyOffersOutput> {
  return detectTrickyOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectTrickyOffersPrompt',
  input: {schema: DetectTrickyOffersInputSchema},
  output: {schema: DetectTrickyOffersOutputSchema},
  prompt: `You are an expert in identifying misleading or tricky offers on e-commerce product pages.
Analyze the content of the webpage at the given URL. Identify any offers, discounts, or promotions that might be considered 'tricky'. This includes, but is not limited to:
- Offers with unclear conditions or fine print.
- Discounts that seem too good to be true or have hidden costs after initial interaction.
- Promotions that pressure users into immediate purchase without full information (e.g., exaggerated scarcity).
- Subscription traps disguised as one-time purchases or difficult-to-cancel trials.
- Misleading comparisons or inflated original prices to make a discount appear larger.

For each tricky offer found, describe:
- offerText: The verbatim text of the offer as seen on the page. If it's a visual element, describe it.
- concern: A clear explanation of why this offer is potentially tricky or misleading.
- advice: Actionable advice to the user on how to approach this offer cautiously (e.g., 'Check for hidden fees at checkout', 'Look for cancellation terms before subscribing').

If no tricky offers are found, return an empty array.

URL: {{{url}}}
  `,
});

const detectTrickyOffersFlow = ai.defineFlow(
  {
    name: 'detectTrickyOffersFlow',
    inputSchema: DetectTrickyOffersInputSchema,
    outputSchema: DetectTrickyOffersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || []; // Ensure an array is always returned
  }
);
