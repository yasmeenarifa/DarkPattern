// src/app/actions.ts
'use server';
import { detectDarkPatterns, type DetectDarkPatternsOutput, type DetectDarkPatternsInput } from '@/ai/flows/detect-dark-patterns';

export interface PricePoint {
  date: string; // YYYY-MM-DD
  price: number;
  source: 'Amazon.in' | 'Flipkart';
}

export interface ProductAnalysisResult {
  url: string;
  darkPatterns: DetectDarkPatternsOutput;
  priceHistory: PricePoint[];
  productName: string;
  productImage: string;
}

export interface ActionResponse {
  data?: ProductAnalysisResult;
  error?: string;
}

// Mock price data generation
const generateMockPriceHistory = (days: number): PricePoint[] => {
  const history: PricePoint[] = [];
  const today = new Date();
  const sources: ('Amazon.in' | 'Flipkart')[] = ['Amazon.in', 'Flipkart'];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Simulate data for Amazon
    if (Math.random() > 0.2) { // 80% chance of having Amazon data
        const amazonPrice = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
        history.push({
            date: date.toISOString().split('T')[0],
            price: amazonPrice,
            source: 'Amazon.in',
        });
    }

    // Simulate data for Flipkart
    if (Math.random() > 0.2) { // 80% chance of having Flipkart data
        const flipkartPrice = Math.floor(Math.random() * (4800 - 450 + 1)) + 450; // Slightly different range
        history.push({
            date: date.toISOString().split('T')[0],
            price: flipkartPrice,
            source: 'Flipkart',
        });
    }
  }
  // Sort by date primarily, then by source for consistent order if multiple entries on same date (though unlikely with current logic)
  return history.sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.source.localeCompare(b.source);
  });
};


export async function analyzeProductUrl(url: string): Promise<ActionResponse> {
  if (!url || !URL.canParse(url)) {
    return { error: 'Invalid URL provided. Please ensure it is a full and valid web address.' };
  }

  try {
    const aiInput: DetectDarkPatternsInput = { url };
    // Ensure detectDarkPatterns returns an array, even if empty or nullish from AI
    const detectedPatterns = (await detectDarkPatterns(aiInput)) || []; 

    const urlObj = new URL(url);
    let productName = urlObj.hostname.replace(/^www\./, '');
    if (urlObj.pathname && urlObj.pathname !== '/') {
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0) {
            productName += ` - ${pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
        }
    } else {
        productName += " Product";
    }
    

    const result: ProductAnalysisResult = {
      url,
      darkPatterns: detectedPatterns,
      priceHistory: generateMockPriceHistory(30),
      productName: productName,
      productImage: `https://placehold.co/600x400.png`,
    };

    return { data: result };
  } catch (error) {
    console.error('Error in analyzeProductUrl:', error);
    // Provide a more generic error to the client
    if (error instanceof Error && error.message.includes('fetch')) {
         return { error: 'Failed to analyze URL. The web page might be inaccessible or blocking requests.' };
    }
    return { error: 'An unexpected error occurred while analyzing the URL. Please try again.' };
  }
}
