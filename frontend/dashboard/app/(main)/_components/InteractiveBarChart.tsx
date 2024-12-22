"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { date: "2024-04-01", user: 222, generate: 150 },
  { date: "2024-04-02", user: 97, generate: 180 },
  { date: "2024-04-03", user: 167, generate: 120 },
  { date: "2024-04-04", user: 242, generate: 260 },
  { date: "2024-04-05", user: 373, generate: 290 },
  { date: "2024-04-06", user: 301, generate: 340 },
  { date: "2024-04-07", user: 245, generate: 180 },
  { date: "2024-04-08", user: 409, generate: 320 },
  { date: "2024-04-09", user: 59, generate: 110 },
  { date: "2024-04-10", user: 261, generate: 190 },
  { date: "2024-04-11", user: 327, generate: 350 },
  { date: "2024-04-12", user: 292, generate: 210 },
  { date: "2024-04-13", user: 342, generate: 380 },
  { date: "2024-04-14", user: 137, generate: 220 },
  { date: "2024-04-15", user: 120, generate: 170 },
  { date: "2024-04-16", user: 138, generate: 190 },
  { date: "2024-04-17", user: 446, generate: 360 },
  { date: "2024-04-18", user: 364, generate: 410 },
  { date: "2024-04-19", user: 243, generate: 180 },
  { date: "2024-04-20", user: 89, generate: 150 },
  { date: "2024-04-21", user: 137, generate: 200 },
  { date: "2024-04-22", user: 224, generate: 170 },
  { date: "2024-04-23", user: 138, generate: 230 },
  { date: "2024-04-24", user: 387, generate: 290 },
  { date: "2024-04-25", user: 215, generate: 250 },
  { date: "2024-04-26", user: 75, generate: 130 },
  { date: "2024-04-27", user: 383, generate: 420 },
  { date: "2024-04-28", user: 122, generate: 180 },
  { date: "2024-04-29", user: 315, generate: 240 },
  { date: "2024-04-30", user: 454, generate: 380 },
  { date: "2024-05-01", user: 165, generate: 220 },
  { date: "2024-05-02", user: 293, generate: 310 },
  { date: "2024-05-03", user: 247, generate: 190 },
  { date: "2024-05-04", user: 385, generate: 420 },
  { date: "2024-05-05", user: 481, generate: 390 },
  { date: "2024-05-06", user: 498, generate: 520 },
  { date: "2024-05-07", user: 388, generate: 300 },
  { date: "2024-05-08", user: 149, generate: 210 },
  { date: "2024-05-09", user: 227, generate: 180 },
  { date: "2024-05-10", user: 293, generate: 330 },
  { date: "2024-05-11", user: 335, generate: 270 },
  { date: "2024-05-12", user: 197, generate: 240 },
  { date: "2024-05-13", user: 197, generate: 160 },
  { date: "2024-05-14", user: 448, generate: 490 },
  { date: "2024-05-15", user: 473, generate: 380 },
  { date: "2024-05-16", user: 338, generate: 400 },
  { date: "2024-05-17", user: 499, generate: 420 },
  { date: "2024-05-18", user: 315, generate: 350 },
  { date: "2024-05-19", user: 235, generate: 180 },
  { date: "2024-05-20", user: 177, generate: 230 },
  { date: "2024-05-21", user: 82, generate: 140 },
  { date: "2024-05-22", user: 81, generate: 120 },
  { date: "2024-05-23", user: 252, generate: 290 },
  { date: "2024-05-24", user: 294, generate: 220 },
  { date: "2024-05-25", user: 201, generate: 250 },
  { date: "2024-05-26", user: 213, generate: 170 },
  { date: "2024-05-27", user: 420, generate: 460 },
  { date: "2024-05-28", user: 233, generate: 190 },
  { date: "2024-05-29", user: 78, generate: 130 },
  { date: "2024-05-30", user: 340, generate: 280 },
  { date: "2024-05-31", user: 178, generate: 230 },
  { date: "2024-06-01", user: 178, generate: 200 },
  { date: "2024-06-02", user: 470, generate: 410 },
  { date: "2024-06-03", user: 103, generate: 160 },
  { date: "2024-06-04", user: 439, generate: 380 },
  { date: "2024-06-05", user: 88, generate: 140 },
  { date: "2024-06-06", user: 294, generate: 250 },
  { date: "2024-06-07", user: 323, generate: 370 },
  { date: "2024-06-08", user: 385, generate: 320 },
  { date: "2024-06-09", user: 438, generate: 480 },
  { date: "2024-06-10", user: 155, generate: 200 },
  { date: "2024-06-11", user: 92, generate: 150 },
  { date: "2024-06-12", user: 492, generate: 420 },
  { date: "2024-06-13", user: 81, generate: 130 },
  { date: "2024-06-14", user: 426, generate: 380 },
  { date: "2024-06-15", user: 307, generate: 350 },
  { date: "2024-06-16", user: 371, generate: 310 },
  { date: "2024-06-17", user: 475, generate: 520 },
  { date: "2024-06-18", user: 107, generate: 170 },
  { date: "2024-06-19", user: 341, generate: 290 },
  { date: "2024-06-20", user: 408, generate: 450 },
  { date: "2024-06-21", user: 169, generate: 210 },
  { date: "2024-06-22", user: 317, generate: 270 },
  { date: "2024-06-23", user: 480, generate: 530 },
  { date: "2024-06-24", user: 132, generate: 180 },
  { date: "2024-06-25", user: 141, generate: 190 },
  { date: "2024-06-26", user: 434, generate: 380 },
  { date: "2024-06-27", user: 448, generate: 490 },
  { date: "2024-06-28", user: 149, generate: 200 },
  { date: "2024-06-29", user: 103, generate: 160 },
  { date: "2024-06-30", user: 446, generate: 400 },
];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  user: {
    label: "User",
    color: "hsl(var(--chart-1))",
  },
  generate: {
    label: "Generate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function InteractiveBarChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("user");

  const total = React.useMemo(
    () => ({
      user: chartData.reduce((acc, curr) => acc + curr.user, 0),
      generate: chartData.reduce((acc, curr) => acc + curr.generate, 0),
    }),
    []
  );

  return (
    <Card className="h-full shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle>User & Generate</CardTitle>
          <CardDescription>
            A summary of the users and generate data.
          </CardDescription>
        </div>
        <div className="flex flex-row lg:border-l">
          {["user", "generate"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full lg:h-[400px]"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
