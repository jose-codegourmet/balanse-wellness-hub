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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@balanse/ui";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowUpDownIcon, ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { AdminDataTableDensity, AdminDataTableLabels } from "./AdminDataTable.meta";

function facetColumnsOf<TData>(table: Table<TData>) {
  return table
    .getAllColumns()
    .filter((column) => column.columnDef.meta?.enableFaceting && column.getCanFilter());
}

function columnLabel<TData>(column: Column<TData, unknown>): string {
  return typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
}

function FacetList<TData>({
  table,
  columns,
}: {
  table: Table<TData>;
  columns: Column<TData, unknown>[];
}) {
  return (
    <div className="grid gap-4">
      {columns.map((column) => {
        const selected = Array.isArray(column.getFilterValue())
          ? (column.getFilterValue() as string[])
          : [];
        const values = [...column.getFacetedUniqueValues().keys()]
          .map((value) => String(value))
          .sort((a, b) => a.localeCompare(b));
        const label = column.columnDef.meta?.facetLabel ?? columnLabel(column);

        return (
          <div key={column.id} className="grid gap-1.5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {label}
            </p>
            <div className="grid gap-1">
              {values.map((value) => {
                const checked = selected.includes(value);
                return (
                  <label
                    key={value}
                    className="flex min-h-11 items-center gap-2 rounded-md px-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={checked}
                      onChange={(event) => {
                        const upcoming = event.target.checked
                          ? [...selected, value]
                          : selected.filter((item) => item !== value);
                        column.setFilterValue(upcoming.length ? upcoming : undefined);
                        table.setPageIndex(0);
                      }}
                    />
                    {value}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  compact = false,
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
  compact?: boolean;
}) {
  const facetColumns = facetColumnsOf(table);
  const hideable = table.getAllColumns().filter((column) => column.getCanHide());
  const sortable = table.getAllColumns().filter((column) => column.getCanSort());
  const sortState = table.getState().sorting[0];
  const facetCount = facetColumns.reduce((count, column) => {
    const selected = Array.isArray(column.getFilterValue())
      ? (column.getFilterValue() as string[]).length
      : 0;
    return count + selected;
  }, 0);

  const search = searchable ? (
    <div className={compact ? "relative w-full" : "relative"}>
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
        className={compact ? "w-full pl-8" : "w-52 pl-8"}
      />
    </div>
  ) : null;

  const sortControl =
    compact && sortable.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="min-h-11">
              <ArrowUpDownIcon className="size-3.5" aria-hidden />
              {labels.sort}
            </Button>
          }
        />
        <DropdownMenuContent className="min-w-52">
          <DropdownMenuLabel>{labels.sort}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortState ? `${sortState.id}:${sortState.desc ? "desc" : "asc"}` : ""}
            onValueChange={(value) => {
              if (!value) {
                table.resetSorting();
                return;
              }
              const [id, direction] = value.split(":");
              table.setSorting([{ id, desc: direction === "desc" }]);
              table.setPageIndex(0);
            }}
          >
            {sortable.map((column) => (
              <div key={column.id}>
                <DropdownMenuRadioItem value={`${column.id}:asc`}>
                  {columnLabel(column)} · {labels.sortAscending}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={`${column.id}:desc`}>
                  {columnLabel(column)} · {labels.sortDescending}
                </DropdownMenuRadioItem>
              </div>
            ))}
            <DropdownMenuRadioItem value="">{labels.sortNone}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const desktopFacets = compact
    ? null
    : facetColumns.map((column) => {
        const selected = Array.isArray(column.getFilterValue())
          ? (column.getFilterValue() as string[])
          : [];
        const values = [...column.getFacetedUniqueValues().keys()]
          .map((value) => String(value))
          .sort((a, b) => a.localeCompare(b));
        const label = column.columnDef.meta?.facetLabel ?? columnLabel(column);

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
      });

  const filtersSheet =
    compact && (facetColumns.length > 0 || enableColumnVisibility) ? (
      <Sheet>
        <SheetTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="min-h-11">
              <SlidersHorizontalIcon className="size-3.5" aria-hidden />
              {labels.filters}
              {facetCount ? ` (${facetCount})` : ""}
            </Button>
          }
        />
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{labels.filters}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-6 px-4 pb-6">
            {facetColumns.length ? <FacetList table={table} columns={facetColumns} /> : null}
            {enableColumnVisibility ? (
              <div className="grid gap-1.5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {labels.columns}
                </p>
                {hideable.map((column) => (
                  <label
                    key={column.id}
                    className="flex min-h-11 items-center gap-2 rounded-md px-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={column.getIsVisible()}
                      onChange={(event) => column.toggleVisibility(event.target.checked)}
                    />
                    {columnLabel(column)}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    ) : null;

  const columnsMenu =
    !compact && enableColumnVisibility ? (
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
          {hideable.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(next) => column.toggleVisibility(next === true)}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const densityMenu = enableDensity ? (
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
  ) : null;

  return (
    <div className={compact ? "flex w-full flex-col gap-3" : "flex flex-wrap items-center gap-3"}>
      {search}
      <div className="flex flex-wrap items-center gap-2">
        {filtersSheet}
        {sortControl}
        {desktopFacets}
        {toolbar}
        {columnsMenu}
        {densityMenu}
      </div>
    </div>
  );
}
