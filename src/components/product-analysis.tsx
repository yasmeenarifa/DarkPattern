// src/components/product-analysis.tsx
"use client";

import type { ProductAnalysisResult } from "@/app/actions";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkPatternCard } from "./dark-pattern-card";
import { PriceHistoryChart } from "./price-history-chart";
import { LinkIcon, ScanEye, AreaChart, AlertOctagon } from "lucide-react"; 

interface ProductAnalysisProps {
  analysis: ProductAnalysisResult;
}

export function ProductAnalysis({ analysis }: ProductAnalysisProps) {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-secondary/30 p-6 border-b">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full md:w-1/3 aspect-[16/10] rounded-md overflow-hidden border border-border shadow-sm">
              <Image
                src={analysis.productImage}
                alt={analysis.productName}
                fill
                className="object-cover"
                data-ai-hint="product package"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="flex-1 pt-1 md:pt-2">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{analysis.productName}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Analyzed URL:{" "}
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1.5 break-all"
                >
                  {analysis.url} <LinkIcon className="h-4 w-4 shrink-0" />
                </a>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-accent">
              <AlertOctagon className="h-7 w-7" />
              Detected Dark Patterns
            </h2>
            {analysis.darkPatterns && analysis.darkPatterns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.darkPatterns.map((pattern, index) => (
                  <DarkPatternCard key={index} pattern={pattern} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed rounded-md bg-muted/50">
                <ScanEye className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3" />
                <p className="text-foreground font-medium">No Dark Patterns Detected</p>
                <p className="text-sm text-muted-foreground mt-1">This page appears to be free of common dark patterns, or they were not recognized by our current analysis.</p>
              </div>
            )}
          </section>

          <section>
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-primary">
                <AreaChart className="h-7 w-7" />
                Price Tracker
            </h2>
            <PriceHistoryChart priceHistory={analysis.priceHistory} />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
