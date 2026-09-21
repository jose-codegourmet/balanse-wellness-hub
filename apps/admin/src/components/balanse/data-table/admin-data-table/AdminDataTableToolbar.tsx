"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@balanse/ui";
import type { Table } from "@tanstack/react-table";
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { AdminDataTableDensity, AdminDataTableLabels } from "./AdminDataTable.schema";

export function AdminDataTableToolbar<TData>({
  table,
  labels,
  searchPlaceholder,
  searchable,
  searchId,
  query,
  onQueryChange,
  toolbar,
  enableColumnVisibility,
  enableDensity,
  density,
  onDensityChange,
}: {
  table: Table<TData>;
  labels: AdminDataTableLabels;
  searchPlaceholder: string;
  searchable: boolean;
  searchId: string;
  query: string;
  onQueryChange: (value: string) => void;
  toolbar?: ReactNode;
  enableColumnVisibility: boolean;
  enableDensity: boolean;
  density: AdminDataTableDensity;
  onDensityChange: (density: AdminDataTableDensity) => void;
}) {
  const facetColumns = table
    .getAllColumns()
    .filter((column) => column.columnDef.meta?.enableFaceting && column.getCanFilter());

  return (
    <div className="flex flex-wrap items-center gap-3">
      {searchable ? (
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="search"
            size="md"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-52 pl-8"
          />
        </div>
      ) : null}

      {facetColumns.map((column) => {
        const selected = Array.isArray(column.getFilterValue())
          ? (column.getFilterValue() as string[])
          : [];
        const values = [...column.getFacetedUniqueValues().keys()]
          .map((value) => String(value))
          .sort((a, b) => a.localeCompare(b));
        const label =
          column.columnDef.meta?.facetLabel ?? String(column.columnDef.header ?? column.id);

        return (
          <DropdownMenu key={column.id}>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  {label}
                  {selected.length ? ` (${selected.length})` : ""}
                  <ChevronDownIcon className="size-3.5" aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent className="min-w-44">
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {values.map((value) => {
                const checked = selected.includes(value);
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={checked}
                    onCheckedChange={(next) => {
                      const isChecked = next === true;
                      const upcoming = isChecked
                        ? [...selected, value]
                        : selected.filter((item) => item !== value);
                      column.setFilterValue(upcoming.length ? upcoming : undefined);
                      table.setPageIndex(0);
                    }}
                  >
                    {value}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {toolbar}

      {enableColumnVisibility ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                <SlidersHorizontalIcon className="size-3.5" aria-hidden />
                {labels.columns}
              </Button>
            }
          />
          <DropdownMenuContent className="min-w-44">
            <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(next) => column.toggleVisibility(next === true)}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {enableDensity ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                {labels.density}
                <ChevronDownIcon className="size-3.5" aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent className="min-w-40">
            <DropdownMenuRadioGroup
              value={density}
              onValueChange={(value) => {
                if (value === "comfortable" || value === "compact") onDensityChange(value);
              }}
            >
              <DropdownMenuRadioItem value="comfortable">
                {labels.densityComfortable}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">{labels.densityCompact}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
