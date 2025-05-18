// src/components/dark-patterns-summary-chart.tsx
"use client";

import type { DetectDarkPatternsOutput } from '@/ai/flows/detect-dark-patterns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useMemo } from 'react';

interface DarkPatternsSummaryChartProps {
  darkPatterns: DetectDarkPatternsOutput;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function DarkPatternsSummaryChart({ darkPatterns }: DarkPatternsSummaryChartProps) {
  const patternCounts = useMemo(() => {
    if (!darkPatterns || darkPatterns.length === 0) {
      return [];
    }
    const counts: { [key: string]: number } = {};
    darkPatterns.forEach(pattern => {
      counts[pattern.patternType] = (counts[pattern.patternType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total);
  }, [darkPatterns]);

  if (patternCounts.length === 0) {
    return (
        <Card className="shadow-md border-border/50">
            <CardHeader>
                <CardTitle>Dark Patterns Overview</CardTitle>
                <CardDescription>A summary of detected dark pattern types.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No dark pattern data to display for summary.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader>
        {/* Title and Description are part of the section header in product-analysis.tsx now */}
        {/* <CardTitle>Dark Patterns Overview</CardTitle> */}
        {/* <CardDescription>Count of each detected dark pattern type.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={patternCounts}
            layout="vertical"
            margin={{
              top: 5,
              right: 20,
              left: 20, // Increased left margin for longer labels
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="total" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={150} // Adjust width based on expected label length
              interval={0} // Show all labels
            />
            <ChartTooltip
              cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
              content={<ChartTooltipContent 
                labelFormatter={(value, payload) => payload?.[0]?.payload.name || value} 
                formatter={(value) => [value, "Count"]}
              />}
            />
            <Bar dataKey="total" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
