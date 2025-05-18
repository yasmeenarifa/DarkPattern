// src/components/product-analysis.tsx
"use client";

import type { ProductAnalysisResult } from "@/app/actions";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkPatternCard } from "./dark-pattern-card";
import { PriceHistoryChart } from "./price-history-chart";
import { DarkPatternsSummaryChart } from "./dark-patterns-summary-chart";
import { LinkIcon, ScanEye, AreaChart, AlertOctagon, BarChart3, ShieldAlert } from "lucide-react"; 

interface ProductAnalysisProps {
  analysis: ProductAnalysisResult;
}

export function ProductAnalysis({ analysis }: ProductAnalysisProps) {
  const hasDarkPatterns = analysis.darkPatterns && analysis.darkPatterns.length > 0;

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden shadow-2xl rounded-xl bg-card/90 backdrop-blur-md border-border/60">
        <CardHeader className="bg-gradient-to-br from-secondary/40 to-secondary/20 p-6 md:p-8 border-b border-border/50">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="relative w-full lg:w-2/5 aspect-[16/10] rounded-lg overflow-hidden border-2 border-border/30 shadow-lg transition-all hover:scale-[1.02] duration-300">
              <Image
                src={analysis.productImage}
                alt={analysis.productName}
                fill
                className="object-cover"
                data-ai-hint="product package"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 33vw"
              />
            </div>
            <div className="flex-1 pt-1 lg:pt-2">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2.5 leading-tight text-foreground">{analysis.productName}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Analyzed URL:{" "}
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1.5 break-all group"
                >
                  {analysis.url} <LinkIcon className="h-4 w-4 shrink-0 group-hover:text-accent transition-colors" />
                </a>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-accent">
              <AlertOctagon className="h-7 w-7" />
              Detected Dark Patterns
            </h2>
            {hasDarkPatterns ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.darkPatterns.map((pattern, index) => (
                  <DarkPatternCard key={index} pattern={pattern} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                <ScanEye className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-lg text-foreground font-medium">No Dark Patterns Detected</p>
                <p className="text-sm text-muted-foreground mt-1.5">This page appears to be free of common dark patterns, or they were not recognized by our current analysis.</p>
              </div>
            )}
          </section>

          {hasDarkPatterns && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-indigo-500 dark:text-indigo-400">
                  <BarChart3 className="h-7 w-7" />
                  Dark Patterns Overview
              </h2>
              <DarkPatternsSummaryChart darkPatterns={analysis.darkPatterns} />
            </section>
          )}

          <section>
             <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-primary">
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
