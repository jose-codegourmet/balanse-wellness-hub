"use client";

import { cn, Tabs, TabsContent, TabsList, TabsTrigger, useIsMobile } from "@balanse/ui";
import { useEffect, useRef } from "react";
import type { AdminPageTabsProps } from "./AdminPageTabs.schema";

export function AdminPageTabs({
  tabs,
  value,
  onValueChange,
  children,
  className,
  mobileBehavior = "tabs",
  label = "Page sections",
}: AdminPageTabsProps) {
  const isMobile = useIsMobile();
  const chips = isMobile && mobileBehavior === "tabs";
  const hideList = isMobile && mobileBehavior === "stack";
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chips) return;
    const active = listRef.current?.querySelector<HTMLElement>(
      "[data-slot='tabs-trigger'][data-active]",
    );
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [chips, value]);

  function selectTab(next: string) {
    if (next === value) return;
    onValueChange(next);
  }

  const chipTriggers = tabs.map((tab) => (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      className={cn(
        "snap-start shrink-0 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm after:hidden data-active:bg-primary data-active:font-medium data-active:text-primary-foreground data-active:shadow-none",
        tab.error &&
          "border-destructive text-destructive data-active:bg-destructive data-active:text-destructive-foreground",
      )}
      onClick={() => selectTab(tab.id)}
    >
      {tab.label}
      {tab.error ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
    </TabsTrigger>
  ));

  const lineTriggers = tabs.map((tab) => (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      className="data-active:font-semibold data-active:text-foreground"
      onClick={() => selectTab(tab.id)}
    >
      {tab.label}
      {tab.error ? <span className="size-1.5 rounded-full bg-destructive" aria-hidden /> : null}
    </TabsTrigger>
  ));

  return (
    <Tabs value={value} onValueChange={selectTab} className={cn("gap-4", className)}>
      {hideList ? null : chips ? (
        <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background px-4 py-3">
          <div ref={listRef} className="min-w-0 overflow-x-auto">
            <TabsList
              variant="line"
              aria-label={label}
              className="h-auto w-max max-w-none flex-nowrap justify-start gap-2 scroll-px-1 snap-x snap-mandatory rounded-none bg-transparent p-0"
            >
              {chipTriggers}
            </TabsList>
          </div>
        </div>
      ) : (
        <TabsList variant="line" aria-label={label}>
          {lineTriggers}
        </TabsList>
      )}
      {children ? <TabsContent value={value}>{children}</TabsContent> : null}
    </Tabs>
  );
}
