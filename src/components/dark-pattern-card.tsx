// src/components/dark-pattern-card.tsx
import type { DetectDarkPatternsOutput } from "@/ai/flows/detect-dark-patterns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

type DarkPattern = DetectDarkPatternsOutput[0];

interface DarkPatternCardProps {
  pattern: DarkPattern;
}

export function DarkPatternCard({ pattern }: DarkPatternCardProps) {
  return (
    <Card className="border-l-4 border-accent shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3 pt-5">
        <div className="p-2.5 rounded-full bg-accent/10 mt-0.5">
            <ShieldAlert className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground">{pattern.patternType}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              On Element: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground/80 break-all">{pattern.element}</code>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="flex items-start gap-2.5 text-sm ml-1">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground/80 shrink-0" />
          <p className="text-muted-foreground leading-relaxed">{pattern.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
