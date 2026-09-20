"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/jabkit/lib/cn";

export type AdminStatTrend = "up" | "down" | "stable";

export type AdminStat = {
  id: string;
  label: string;
  value: string;
  href?: string;
  delta?: string;
  period?: string;
  trend?: AdminStatTrend;
  bars?: number[];
  icon: LucideIcon;
};

const trendTone: Record<AdminStatTrend, { text: string; bar: string; Icon: LucideIcon }> = {
  up: { text: "text-primary", bar: "bg-primary", Icon: ArrowUpRight },
  down: { text: "text-destructive", bar: "bg-destructive", Icon: ArrowDownRight },
  stable: { text: "text-muted-foreground", bar: "bg-muted-foreground", Icon: Minus },
};

function sparkBars(value: string): number[] {
  const numeric = Number(String(value).replace(/[^\d.]/g, "")) || 4;
  return [18, 22, 16, 26, 20, 28, 24].map((base, index) =>
    Math.max(10, Math.round(base + ((numeric + index) % 5) * 2)),
  );
}

export function AdminStatStrip({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const trend = trendTone[stat.trend ?? "stable"];
        const bars = stat.bars ?? sparkBars(stat.value);
        const body = (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Icon className="size-4" />
              {stat.label}
            </div>
            <div className="mt-8 flex items-end justify-between">
              <div>
                <div className="text-3xl font-light tracking-tight tabular-nums">{stat.value}</div>
                {stat.delta ? (
                  <div className={cn("mt-2 flex items-center gap-1 text-xs", trend.text)}>
                    <trend.Icon className="size-4" />
                    <span>{stat.delta}</span>
                    {stat.period ? (
                      <span className="text-muted-foreground">{stat.period}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex items-end gap-1">
                {bars.map((height, barIndex) => (
                  <span
                    key={`${stat.id}-bar-${barIndex + 1}`}
                    className={cn(
                      "w-1.5 rounded-full motion-safe:transition-[height] motion-safe:duration-700",
                      trend.bar,
                    )}
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
          </>
        );

        const frameClass = cn(
          "block p-4 md:p-5",
          index ? "border-border/50 border-t md:border-t-0 md:border-l" : null,
          stat.href
            ? "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : null,
        );

        return stat.href ? (
          <Link key={stat.id} href={stat.href} className={frameClass}>
            {body}
          </Link>
        ) : (
          <div key={stat.id} className={frameClass}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
