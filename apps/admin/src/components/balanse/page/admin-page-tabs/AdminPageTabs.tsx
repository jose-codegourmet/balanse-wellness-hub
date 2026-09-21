"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@balanse/ui";
import { cn } from "@/lib/utils";
import type { AdminPageTabsProps } from "./AdminPageTabs.schema";

export function AdminPageTabs({
  tabs,
  value,
  onValueChange,
  children,
  className,
}: AdminPageTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("gap-4", className)}>
      <TabsList variant="line" aria-label="Page sections">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="data-active:font-semibold data-active:text-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children ? <TabsContent value={value}>{children}</TabsContent> : null}
    </Tabs>
  );
}
