"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@balanse/ui";
import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

import type { AdminDataTableLabels, AdminDataTableRowAction } from "./AdminDataTable.schema";

export function AdminDataTableRowActions<TData>({
  row,
  actions,
  labels,
  rowName,
}: {
  row: TData;
  actions: AdminDataTableRowAction<TData>[];
  labels: AdminDataTableLabels;
  rowName: string;
}) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`${labels.rowActions} for ${rowName}`}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {actions.map((action) =>
          action.href ? (
            <DropdownMenuItem
              key={action.id}
              variant={action.destructive ? "destructive" : "default"}
              render={<Link href={action.href} />}
            >
              {action.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={action.id}
              variant={action.destructive ? "destructive" : "default"}
              onClick={() => action.onClick?.(row)}
            >
              {action.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
