# Chart — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Themed Recharts wrapper that injects CSS color variables and shared tooltip/legend content.

## When to use

- Bar/line (and other Recharts) dashboards with design-token colors

## When NOT to use

- Tabular data without a chart → use **Table** or **DataTable** instead
- Decorative non-data visuals → use **Card** or **AspectRatio** instead

## Examples

### Bar chart with two series

Each `config` key becomes a `--color-{key}` variable you reference in Recharts props.

```tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@balanse/ui";

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} className="min-h-[240px] w-full max-w-xl">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>;
```

### Line chart with line indicator

`ChartTooltipContent` supports `indicator="line" | "dot" | "dashed"` and `hideLabel`.

```tsx
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

<ChartContainer config={chartConfig} className="min-h-[240px] w-full max-w-xl">
  <LineChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
    <Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>;
```

## Gotchas

- `"use client"` required
- Children must be Recharts chart components inside `ChartContainer`
- Series colors come from the injected `--color-{key}` variables
