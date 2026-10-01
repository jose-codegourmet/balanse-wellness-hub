"use client";

import { cn, Tabs, TabsContent, TabsList, TabsTrigger, useIsMobile } from "@balanse/ui";
import { useEffect, useRef } from "react";
import type { AdminPageTabsProps } from "./AdminPageTabs.meta";

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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chips) return;
    const scroller = scrollRef.current;
    const active = scroller?.querySelector<HTMLElement>("[data-active]");
    if (!scroller || !active) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    scroller.scrollTo({
      left:
        scroller.scrollLeft +
        activeRect.left -
        scrollerRect.left -
        (scrollerRect.width - activeRect.width) / 2,
      behavior: "smooth",
    });
  }, [chips, value]);

  const triggers = tabs.map((tab) => (
    <TabsTrigger
      key={tab.id}
      type="button"
      value={tab.id}
      variant={chips ? "chip" : "default"}
      className={
        chips
          ? cn(
              tab.error && "border-destructive text-destructive",
              tab.error &&
                "data-active:border-destructive data-active:bg-destructive data-active:text-destructive-foreground",
            )
          : "text-foreground/70 data-active:font-semibold"
      }
    >
      {tab.label}
      {tab.error ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
    </TabsTrigger>
  ));

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string" && next !== value) onValueChange(next);
      }}
      className={cn("min-w-0 gap-4", className)}
    >
      {hideList ? null : chips ? (
        <div
          ref={scrollRef}
          className="sticky top-0 z-20 -mx-4 overflow-x-auto border-b border-border bg-background px-4 py-3 scroll-px-4 [scrollbar-width:none]"
        >
          <TabsList
            variant="chip"
            aria-label={label}
            activateOnFocus
            className="w-max max-w-none flex-nowrap justify-start"
          >
            {triggers}
          </TabsList>
        </div>
      ) : (
        <TabsList
          variant="line"
          aria-label={label}
          activateOnFocus
          className="border-b border-transparent text-foreground/70"
        >
          {triggers}
        </TabsList>
      )}
      {children ? <TabsContent value={value}>{children}</TabsContent> : null}
    </Tabs>
  );
}
