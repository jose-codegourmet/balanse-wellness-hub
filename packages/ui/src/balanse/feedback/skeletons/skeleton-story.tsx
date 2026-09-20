import { BALANSE_BREAKPOINTS } from "@balanse/config";
import type { ReactNode } from "react";

export const SHELL_WIDTH = {
  mobile: BALANSE_BREAKPOINTS.mobile,
  tablet: BALANSE_BREAKPOINTS.tablet,
  desktop: BALANSE_BREAKPOINTS.desktop,
} as const;

export function ShellStoryFrame({
  width,
  dark = false,
  children,
}: {
  width: number;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        dark ? "dark bg-background p-4 text-foreground" : "bg-background p-4 text-foreground"
      }
      style={{ width }}
    >
      {children}
    </div>
  );
}

export function ReducedMotionNote({ children }: { children: ReactNode }) {
  return (
    <div className="skeleton-reduced-motion space-y-3">
      <style>{".skeleton-reduced-motion [data-slot='skeleton']{animation:none!important}"}</style>
      <p className="text-sm text-muted-foreground">
        Storybook cannot force <code>prefers-reduced-motion</code>. This story applies a local
        override so the layout can be reviewed still. Confirm the real{" "}
        <code>motion-safe:animate-pulse</code> rule with the OS setting.
      </p>
      {children}
    </div>
  );
}
