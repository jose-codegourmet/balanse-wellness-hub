"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/jabkit/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./Chart";
import { chartMocks } from "./Chart.mocks";

export function ChartBarDefault() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{chartMocks.default.title}</CardTitle>
        <CardDescription>{chartMocks.default.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartMocks.default.config}>
          <BarChart accessibilityLayer data={[...chartMocks.default.data]}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {chartMocks.default.trend} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {chartMocks.default.footer}
        </div>
      </CardFooter>
    </Card>
  );
}

export function ChartBarMultiple() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{chartMocks.multiple.title}</CardTitle>
        <CardDescription>{chartMocks.multiple.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="min-h-[200px] w-full"
          config={chartMocks.multiple.config}
        >
          <BarChart accessibilityLayer data={[...chartMocks.multiple.data]}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {chartMocks.multiple.trend} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {chartMocks.multiple.footer}
        </div>
      </CardFooter>
    </Card>
  );
}
