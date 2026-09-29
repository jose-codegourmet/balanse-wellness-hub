"use client";

import { formatPeso } from "@balanse/domain";
import { Input } from "@balanse/ui";
import { CheckIcon, DumbbellIcon, SearchIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { ClassTilePickerProps } from "./ClassTilePicker.meta";

const SEARCH_THRESHOLD = 8;

export function ClassTilePicker({
  classes,
  value,
  onChange,
  invalid = false,
}: ClassTilePickerProps) {
  const name = useId();
  const [search, setSearch] = useState("");
  const needle = search.trim().toLowerCase();
  const visible = classes.filter((row) => !needle || row.name.toLowerCase().includes(needle));

  return (
    <div className="grid gap-3">
      {classes.length > SEARCH_THRESHOLD ? (
        <div className="relative">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search classes"
            invalid={false}
            className="pl-9"
            placeholder="Search classes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      ) : null}
      <div
        role="radiogroup"
        aria-label="Class"
        aria-invalid={invalid || undefined}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
      >
        {visible.map((row) => {
          const checked = row.id === value;
          return (
            <label
              key={row.id}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-background transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                checked
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50",
                !row.active && "opacity-70",
              )}
            >
              <input
                type="radio"
                name={name}
                value={row.id}
                checked={checked}
                onChange={() => onChange(row.id)}
                className="sr-only"
              />
              <span className="relative aspect-[2/1] bg-muted">
                {row.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.heroImage} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-muted-foreground">
                    <DumbbellIcon aria-hidden className="size-5" />
                  </span>
                )}
                {checked ? (
                  <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon aria-hidden className="size-3.5" />
                  </span>
                ) : null}
              </span>
              <span className="grid gap-0.5 px-3 py-2">
                <span className="truncate text-sm font-medium">{row.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {[
                    row.defaultDurationMinutes ? `${row.defaultDurationMinutes} min` : null,
                    row.defaultPricePhp != null ? formatPeso(row.defaultPricePhp) : null,
                    row.active ? null : "Inactive",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No defaults"}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classes match that search.</p>
      ) : null}
    </div>
  );
}
