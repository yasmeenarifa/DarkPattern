
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
import { Loader2, AlertCircle, SearchCode, ShieldCheck, Github } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 text-foreground flex flex-col items-center pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-16 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4 text-primary">
             <SearchCode className="h-10 w-10 sm:h-14 sm:w-14" />
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                Dark Pattern Detector
             </h1>
          </div>
          <p className="text-md sm:text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
            Uncover deceptive design tricks on e-commerce sites. Enter a product URL to analyze its interface and track price history.
          </p>
        </header>

        <Card className="w-full max-w-xl shadow-xl rounded-xl bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Analyze Product Page</CardTitle>
            <CardDescription>Paste the URL of an e-commerce product page below to begin.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="url"
                placeholder="e.g., https://www.amazon.in/dp/B0ExampleXYZ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/80 bg-background/70 border-border/70"
                aria-label="Product page URL"
                disabled={isPending}
                required
              />
              <Button type="submit" className="w-full h-12 text-lg font-medium rounded-lg gap-2.5 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground" disabled={isPending}>
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
          <Alert variant="destructive" className="w-full max-w-xl mt-8 shadow-md rounded-lg bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !isPending && (
          <div className="w-full max-w-4xl xl:max-w-5xl mt-10">
            <ProductAnalysis analysis={analysisResult} />
          </div>
        )}
        
        {!analysisResult && !error && !isPending && (
             <div className="w-full max-w-xl text-center mt-10 p-8 bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-dashed border-border/50">
                <ShieldCheck className="h-14 w-14 text-primary/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground">Ready to Analyze</h3>
                <p className="text-muted-foreground mt-1">Enter a URL above to reveal insights about product pages and pricing.</p>
            </div>
        )}
      </div>
      <Toaster />
       <footer className="text-center py-10 border-t border-border/50 bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Dark Pattern Detector - Empowering consumers with transparency.
        </p>
         <p className="text-sm text-muted-foreground mt-2">
          The Project is Created By Yasmeen Arifa S
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Built with Next.js, ShadCN/UI, and Genkit AI.
          <Link href="https://github.com/FirebaseExtended/codelab-genkit-dark-patterns" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline ml-1.5 inline-flex items-center gap-1">
            <Github className="h-3.5 w-3.5"/> View Source 
          </Link>
        </p>
      </footer>
    </>
  );
}
