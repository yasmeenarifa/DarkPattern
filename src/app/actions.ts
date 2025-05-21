
// src/app/actions.ts
'use server';
import { detectDarkPatterns, type DetectDarkPatternsOutput, type DetectDarkPatternsInput } from '@/ai/flows/detect-dark-patterns';
import { detectTrickyOffers, type DetectTrickyOffersOutput, type DetectTrickyOffersInput } from '@/ai/flows/detect-tricky-offers';
// summarizeProductReviews is available but not used directly in analyzeProductUrl yet as review text isn't fetched.
// import { summarizeProductReviews, type SummarizeProductReviewsOutput, type SummarizeProductReviewsInput } from '@/ai/flows/summarize-product-reviews';

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
  trickyOffers: DetectTrickyOffersOutput;
  // reviewSummary: SummarizeProductReviewsOutput | null; // Placeholder for future review analysis
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
    
    if (Math.random() > 0.2) {
        const amazonPrice = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
        history.push({
            date: date.toISOString().split('T')[0],
            price: amazonPrice,
            source: 'Amazon.in',
        });
    }

    if (Math.random() > 0.2) {
        const flipkartPrice = Math.floor(Math.random() * (4800 - 450 + 1)) + 450;
        history.push({
            date: date.toISOString().split('T')[0],
            price: flipkartPrice,
            source: 'Flipkart',
        });
    }
  }
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
    const darkPatternsInput: DetectDarkPatternsInput = { url };
    const trickyOffersInput: DetectTrickyOffersInput = { url };

    // Fetch page content once for image extraction (and potentially other uses later)
    let pageHtml = '';
    let productImage = `https://placehold.co/600x400.png`; // Default placeholder
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        if (response.ok) {
            pageHtml = await response.text();
            // Try to extract og:image
            const ogImageMatch = pageHtml.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"\s*\/?>/i);
            if (ogImageMatch && ogImageMatch[1]) {
                productImage = ogImageMatch[1];
            } else {
                 // Try to extract a high-quality image from ld+json
                const ldJsonImageMatch = pageHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
                if (ldJsonImageMatch && ldJsonImageMatch[1]) {
                    try {
                        const ldJson = JSON.parse(ldJsonImageMatch[1]);
                        // Common structures for product image in ld+json
                        const imageSources = [
                            ldJson.image,
                            ldJson.logo,
                            Array.isArray(ldJson.image) ? ldJson.image[0] : null,
                            (ldJson.mainEntity && ldJson.mainEntity.image) ? ldJson.mainEntity.image.url : null,
                            (ldJson.offers && ldJson.offers.image) ? ldJson.offers.image : null,
                        ];
                        for (const src of imageSources) {
                            if (typeof src === 'string' && src.startsWith('http')) {
                                productImage = src;
                                break;
                            } else if (typeof src === 'object' && src !== null && typeof src.url === 'string' && src.url.startsWith('http')) {
                                productImage = src.url;
                                break;
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to parse LD+JSON for image extraction:', e);
                    }
                }
            }
        } else {
            console.warn(`Failed to fetch page content from ${url} for image extraction. Status: ${response.status}`);
        }
    } catch (fetchError) {
        console.warn(`Error fetching page content for image extraction from ${url}:`, fetchError);
    }


    // AI Analysis calls
    const [detectedPatternsResponse, trickyOffersResponse] = await Promise.allSettled([
        detectDarkPatterns(darkPatternsInput),
        detectTrickyOffers(trickyOffersInput)
    ]);
    
    const detectedPatterns = detectedPatternsResponse.status === 'fulfilled' ? (detectedPatternsResponse.value || []) : [];
    const trickyOffers = trickyOffersResponse.status === 'fulfilled' ? (trickyOffersResponse.value || []) : [];

    if (detectedPatternsResponse.status === 'rejected') {
        console.error('Error detecting dark patterns:', detectedPatternsResponse.reason);
    }
    if (trickyOffersResponse.status === 'rejected') {
        console.error('Error detecting tricky offers:', trickyOffersResponse.reason);
    }

    const urlObj = new URL(url);
    let productName = urlObj.hostname.replace(/^www\./, '');
    if (urlObj.pathname && urlObj.pathname !== '/') {
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0) {
            let extractedName = pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            // Remove common extensions or query params often found in product URLs
            extractedName = extractedName.split('.')[0].split('?')[0];
            productName += ` - ${extractedName}`;
        }
    } else {
        productName += " Product";
    }
    

    const result: ProductAnalysisResult = {
      url,
      darkPatterns: detectedPatterns,
      trickyOffers: trickyOffers,
      priceHistory: generateMockPriceHistory(30),
      productName: productName,
      productImage: productImage,
      // reviewSummary: null, // Review analysis needs review text input, not implemented in this step
    };

    return { data: result };
  } catch (error) {
    console.error('Error in analyzeProductUrl:', error);
    let errorMessage = 'An unexpected error occurred while analyzing the URL. Please try again.';
    if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Failed to analyze URL. The web page might be inaccessible, blocking requests, or the URL may be incorrect.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Analysis timed out. The page might be too large or slow to respond.';
        }
    }
    return { error: errorMessage };
  }
}
