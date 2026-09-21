"use client";

import { Button, Kbd, Tooltip, TooltipContent, TooltipTrigger } from "@balanse/ui";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/components/jabkit/lib/cn";
import type { AdminSidebarToggleProps } from "./AdminSidebarToggle.meta";

export function AdminSidebarToggle({
  collapsed,
  onToggle,
  controlsId,
  className,
  ...props
}: AdminSidebarToggleProps) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? PanelLeft : PanelLeftClose;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-expanded={!collapsed}
            aria-controls={controlsId}
            aria-label={label}
            className={cn(
              "shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              className,
            )}
            onClick={onToggle}
            {...props}
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        <Kbd>⌘B</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
