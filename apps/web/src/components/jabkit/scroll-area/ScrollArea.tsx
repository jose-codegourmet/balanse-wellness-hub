// biome-ignore lint/correctness/noUnusedImports: Storybook supports the classic JSX runtime.
import * as React from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { ScrollAreaProps } from "./ScrollArea.types";

const scrollbarClasses =
  "[scrollbar-width:thin] [scrollbar-color:var(--jk-border)_transparent] [&::-webkit-scrollbar]:size-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40";

export function ScrollArea({
  className,
  children,
  orientation = "vertical",
  ...props
}: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      // Overflow regions must be in the tab order so keyboard users can scroll.
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable scroll container
      tabIndex={0}
      className={cn(
        "rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
        orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
        orientation === "both" && "overflow-auto",
        scrollbarClasses,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
