"use client";

import { Button, Kbd, Tooltip, TooltipContent, TooltipTrigger } from "@balanse/ui";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import type { AdminSidebarToggleProps } from "./AdminSidebarToggle.schema";

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
            className={className}
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
