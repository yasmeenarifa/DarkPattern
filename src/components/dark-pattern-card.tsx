// src/components/dark-pattern-card.tsx
import type { DetectDarkPatternsOutput } from "@/ai/flows/detect-dark-patterns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

type DarkPattern = DetectDarkPatternsOutput[0];

interface DarkPatternCardProps {
  pattern: DarkPattern;
}

export function DarkPatternCard({ pattern }: DarkPatternCardProps) {
  return (
    <Card className="border-l-4 border-accent shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <div className="p-2 rounded-full bg-accent/10 mt-1">
            <AlertTriangle className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{pattern.patternType}</CardTitle>
            <CardDescription className="text-sm">
              Element: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground break-all">{pattern.element}</code>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-muted-foreground leading-relaxed">{pattern.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
