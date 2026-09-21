"use client";

import { cn, useIsMobile } from "@balanse/ui";
import { type KeyboardEvent, useEffect, useRef } from "react";
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
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chips) return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !active) return;
    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [chips, value]);

  function selectTab(next: string) {
    if (next === value) return;
    onValueChange(next);
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const ids = tabs.map((tab) => tab.id);
    const index = Math.max(0, ids.indexOf(value));
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = ids[(index + delta + ids.length) % ids.length];
      if (next) selectTab(next);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      const next = ids[0];
      if (next) selectTab(next);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const next = ids[ids.length - 1];
      if (next) selectTab(next);
    }
  }

  const triggers = tabs.map((tab) => {
    const selected = tab.id === value;
    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={selected}
        tabIndex={selected ? 0 : -1}
        className={
          chips
            ? cn(
                "snap-start shrink-0 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm",
                selected && "bg-primary font-medium text-primary-foreground",
                tab.error &&
                  "border-destructive text-destructive data-[selected=true]:bg-destructive data-[selected=true]:text-destructive-foreground",
                selected && tab.error && "bg-destructive text-destructive-foreground",
              )
            : cn(
                "relative inline-flex items-center gap-1.5 border-transparent px-1.5 py-0.5 text-sm font-medium text-foreground/60",
                "after:absolute after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:bg-foreground after:opacity-0",
                selected && "font-semibold text-foreground after:opacity-100",
              )
        }
        data-selected={selected ? "true" : undefined}
        onClick={() => selectTab(tab.id)}
      >
        {tab.label}
        {tab.error ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      </button>
    );
  });

  return (
    <div className={cn("grid gap-4", className)}>
      {hideList ? null : chips ? (
        <div className="sticky top-0 z-20 -mx-4 overflow-hidden border-b border-border bg-background px-4 py-3">
          <div
            ref={listRef}
            role="tablist"
            aria-label={label}
            className="flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto scroll-px-1 snap-x snap-mandatory"
            onKeyDown={onListKeyDown}
          >
            {triggers}
          </div>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label={label}
          className="inline-flex w-fit items-center gap-1 border-b border-transparent"
          onKeyDown={onListKeyDown}
        >
          {triggers}
        </div>
      )}
      {children ? (
        <div role="tabpanel" className="flex-1 text-sm outline-none">
          {children}
        </div>
      ) : null}
    </div>
  );
}
