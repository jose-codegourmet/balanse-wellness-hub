"use client";

import { DashboardTile } from "@/components/balanse/dashboard/dashboard-tile/DashboardTile";
import type { AdminStatStripProps } from "./AdminStatStrip.schema";

export type { AdminStat, AdminStatStripProps } from "./AdminStatStrip.schema";

export function AdminStatStrip({ stats }: AdminStatStripProps) {
  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <DashboardTile key={stat.id} span="stat" href={stat.href}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4" aria-hidden />
              {stat.label}
            </div>
            <p className="mt-6 text-3xl font-light tracking-tight tabular-nums">{stat.value}</p>
          </DashboardTile>
        );
      })}
    </>
  );
}
