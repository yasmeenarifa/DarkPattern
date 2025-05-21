
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
    
    if (Math.random() > 0.2) { // Simulate data availability
        const amazonPrice = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
        history.push({
            date: date.toISOString().split('T')[0],
            price: amazonPrice,
            source: 'Amazon.in',
        });
    }

    if (Math.random() > 0.2) { // Simulate data availability
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

const extractProductName = (url: string): string => {
    try {
        const urlObj = new URL(url);
        let name = urlObj.hostname.replace(/^www\./, '');
        
        const pathSegments = urlObj.pathname.split('/').filter(segment => 
            segment && 
            !segment.match(/^(dp|gp|product|products|item|items|review|reviews|offer|offers)$/i) && // Ignore common path slugs
            !segment.match(/^[a-zA-Z0-9]{8,}$/) && // Ignore potential long IDs
            !segment.match(/\.(html|htm|php|aspx?)$/i) // Ignore file extensions
        );

        if (pathSegments.length > 0) {
            // Prefer longer, more descriptive segments, and join a few if they seem relevant
            const potentialNames = pathSegments
                .map(segment => segment.replace(/-/g, ' ').replace(/_/g, ' '))
                .filter(segment => segment.length > 3 && !segment.match(/^\d+$/)) // filter out short or numeric only segments
                .map(segment => segment.replace(/\b\w/g, l => l.toUpperCase())); // Capitalize
            
            if (potentialNames.length > 0) {
                 // Take the last one or two meaningful segments
                name = potentialNames.slice(-2).join(' - ') ;
            } else {
                name = urlObj.hostname.replace(/^www\./, '') + " Product";
            }
        } else {
            name = urlObj.hostname.replace(/^www\./, '') + " Product";
        }
        // Further clean up
        name = name.split('?')[0]; // Remove query params from name
        return name;

    } catch (e) {
        console.warn('Error extracting product name:', e);
        return "Analyzed Product";
    }
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
        // Use a common user-agent to mimic a browser
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        if (response.ok) {
            pageHtml = await response.text();
            // Try to extract og:image first, as it's often the preferred image
            const ogImageMatch = pageHtml.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"\s*\/?>/i);
            if (ogImageMatch && ogImageMatch[1]) {
                productImage = ogImageMatch[1];
            } else {
                 // Fallback: Try to extract a high-quality image from ld+json if og:image is not found
                const ldJsonImageMatch = pageHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/ig);
                if (ldJsonImageMatch) {
                    for (const scriptContent of ldJsonImageMatch) {
                        const match = scriptContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
                        if (match && match[1]) {
                            try {
                                const ldJson = JSON.parse(match[1]);
                                // Common structures for product image in ld+json
                                // Can be a string, an object with url, or an array of these
                                const imageSources = [
                                    ldJson.image,
                                    ldJson.logo,
                                    Array.isArray(ldJson.image) ? ldJson.image[0] : null,
                                    (ldJson.mainEntity && ldJson.mainEntity.image) ? ldJson.mainEntity.image : null,
                                    (ldJson.offers && ldJson.offers.image) ? ldJson.offers.image : null,
                                ];
                                for (let src of imageSources) {
                                    if (typeof src === 'string' && src.startsWith('http')) {
                                        productImage = src;
                                        break; // Found a good image
                                    } else if (Array.isArray(src)) { // Handle cases where image is an array
                                        const firstImage = src.find(img => typeof img === 'string' && img.startsWith('http')) || 
                                                           src.find(img => typeof img === 'object' && img && typeof img.url === 'string' && img.url.startsWith('http'));
                                        if (firstImage) {
                                            productImage = typeof firstImage === 'string' ? firstImage : firstImage.url;
                                            break;
                                        }
                                    } else if (typeof src === 'object' && src !== null && typeof src.url === 'string' && src.url.startsWith('http')) {
                                        productImage = src.url;
                                        break; // Found a good image
                                    }
                                }
                                if (productImage !== `https://placehold.co/600x400.png`) break; // Exit if a non-placeholder image is found
                            } catch (e) {
                                console.warn('Failed to parse LD+JSON for image extraction:', e);
                                // Continue to next script tag if parsing fails
                            }
                        }
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
    
    const productName = extractProductName(url);

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

