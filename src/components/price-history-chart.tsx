// src/components/price-history-chart.tsx
"use client";

import type { PricePoint } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
}

const chartConfig = {
  amazon: {
    label: "Amazon.in",
    color: "hsl(var(--chart-1))",
  },
  flipkart: {
    label: "Flipkart",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function PriceHistoryChart({ priceHistory }: PriceHistoryChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No price history available to display.</p>;
  }

  const allDates = Array.from(new Set(priceHistory.map(p => p.date))).sort();
  
  const aggregatedData = allDates.map(date => {
    const amazonEntry = priceHistory.find(p => p.date === date && p.source === 'Amazon.in');
    const flipkartEntry = priceHistory.find(p => p.date === date && p.source === 'Flipkart');
    return {
      date,
      amazon: amazonEntry?.price,
      flipkart: flipkartEntry?.price,
    };
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Price History</CardTitle>
        <CardDescription>Price fluctuations over the last 30 days from available sources.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            accessibilityLayer
            data={aggregatedData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => {
                const date = new Date(value + "T00:00:00"); // Ensure date is parsed as local
                return date.toLocaleDateString("en-IN", { // Using en-IN for indian context
                  month: "short",
                  day: "numeric",
                });
              }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `₹${value}`}
              domain={['auto', 'auto']}
            />
            <RechartsTooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                formatter={(value, name) => {
                    const configEntry = chartConfig[name as keyof typeof chartConfig];
                    const label = configEntry ? configEntry.label : name;
                    return [ `₹${Number(value).toFixed(2)}`, label];
                }}
                labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("en-IN", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="amazon"
              type="monotone"
              stroke="var(--color-amazon)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-amazon)", strokeWidth: 1, stroke: "hsl(var(--background))" }}
              activeDot={{ r: 6 }}
              name="Amazon.in"
              connectNulls // Connects lines even if there are null values
            />
            <Line
              dataKey="flipkart"
              type="monotone"
              stroke="var(--color-flipkart)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-flipkart)", strokeWidth: 1, stroke: "hsl(var(--background))" }}
              activeDot={{ r: 6 }}
              name="Flipkart"
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
