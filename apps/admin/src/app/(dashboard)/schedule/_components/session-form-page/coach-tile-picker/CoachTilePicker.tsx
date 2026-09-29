"use client";

import { Button, CoachPhoto } from "@balanse/ui";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CoachTilePickerProps } from "./CoachTilePicker.meta";

const COLLAPSED_COUNT = 6;

export function CoachTilePicker({
  coaches,
  value,
  onChange,
  recommendedIds = [],
  busy,
  invalid = false,
}: CoachTilePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const ordered = [...coaches].sort((a, b) => {
    const rank = (id: string) =>
      (value.includes(id) ? 0 : 2) + (recommendedIds.includes(id) ? 0 : 1);
    return rank(a.id) - rank(b.id) || a.name.localeCompare(b.name);
  });
  const visible = expanded ? ordered : ordered.slice(0, COLLAPSED_COUNT);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((row) => row !== id) : [...value, id]);
  }

  return (
    <div className="grid gap-2">
      <ul
        aria-label="Coaches"
        aria-invalid={invalid || undefined}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {visible.map((coach) => {
          const checked = value.includes(coach.id);
          const busyWith = busy?.get(coach.id);
          return (
            <li key={coach.id}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(coach.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-background p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  checked
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/50",
                  !coach.active && "opacity-70",
                )}
              >
                <CoachPhoto
                  photoKey={coach.photoKey}
                  name={coach.name}
                  ratio="1:1"
                  className="size-10 shrink-0 rounded-full"
                />
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate text-sm font-medium">{coach.name}</span>
                  {busyWith ? (
                    <span className="flex items-center gap-1 truncate text-xs text-foreground">
                      <AlertTriangleIcon aria-hidden className="size-3 shrink-0" />
                      <span className="truncate">Busy: {busyWith}</span>
                    </span>
                  ) : recommendedIds.includes(coach.id) ? (
                    <span className="truncate text-xs text-primary">Teaches this class</span>
                  ) : (
                    <span className="truncate text-xs text-muted-foreground">
                      {coach.specialties.slice(0, 2).join(" · ") || "Coach"}
                      {coach.active ? "" : " · Inactive"}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {checked ? <CheckIcon className="size-3" /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {ordered.length > COLLAPSED_COUNT ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="justify-self-start"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show fewer coaches" : `Show all ${ordered.length} coaches`}
        </Button>
      ) : null}
    </div>
  );
}
