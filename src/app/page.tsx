// src/app/page.tsx
"use client";

import { useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeProductUrl, type ProductAnalysisResult, type ActionResponse } from "./actions";
import { ProductAnalysis } from "@/components/product-analysis";
import { Loader2, AlertCircle, SearchCode, ExternalLink, ShieldCheck } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [url, setUrl] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAnalysisResult(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      toast({
        title: "Input Error",
        description: "A product page URL is required for analysis.",
        variant: "destructive",
      });
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError("Invalid URL format. Please include http:// or https://");
       toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const response: ActionResponse = await analyzeProductUrl(url);
      if (response.data) {
        setAnalysisResult(response.data);
        toast({
          title: "Analysis Complete",
          description: `Insights for ${response.data.productName} are ready.`,
          className: "bg-primary text-primary-foreground",
        });
      } else if (response.error) {
        setError(response.error);
        toast({
          title: "Analysis Failed",
          description: response.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <header className="mb-12 sm:mb-20 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4 text-primary">
             <SearchCode className="h-12 w-12 sm:h-16 sm:w-16" />
             <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                Dark Pattern Detector
             </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Shine a light on deceptive e-commerce practices. Enter a product page URL to analyze its design and track price trends.
          </p>
        </header>

        <Card className="w-full max-w-2xl shadow-xl rounded-xl mb-12">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Analyze Product Page</CardTitle>
            <CardDescription>Paste the URL of an e-commerce product page below.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="url"
                placeholder="e.g., https://www.amazon.in/dp/B0ExampleXYZ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12 px-4 rounded-md focus:ring-2 focus:ring-primary"
                aria-label="Product page URL"
                disabled={isPending}
                required
              />
              <Button type="submit" className="w-full h-12 text-lg font-medium rounded-md gap-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Page...
                  </>
                ) : (
                  "Detect & Track"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && !isPending && (
          <Alert variant="destructive" className="w-full max-w-2xl mb-8 shadow-md rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !isPending && (
          <div className="w-full max-w-4xl xl:max-w-5xl mt-4">
            <ProductAnalysis analysis={analysisResult} />
          </div>
        )}
        
        {!analysisResult && !error && !isPending && (
             <div className="w-full max-w-2xl text-center mt-8 p-8 bg-card rounded-xl shadow-lg border border-dashed border-border">
                <ShieldCheck className="h-16 w-16 text-primary/70 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground">Ready to Analyze</h3>
                <p className="text-muted-foreground mt-1">Enter a URL above to reveal insights about product pages and pricing.</p>
            </div>
        )}
      </div>
      <Toaster />
       <footer className="text-center py-12 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Dark Pattern Detector - Empowering consumers with transparency.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Created with Next.js, ShadCN/UI, and Genkit AI. 
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline ml-1 inline-flex items-center">
            View Source <ExternalLink className="h-3 w-3 ml-0.5"/>
          </Link>
        </p>
      </footer>
    </>
  );
}
