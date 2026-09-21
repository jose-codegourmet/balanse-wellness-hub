"use client";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type AdminDataTableUrlState = {
  query: string;
  sorting: SortingState;
  pageIndex: number;
  columnFilters: ColumnFiltersState;
  write: (next: {
    query: string;
    sorting: SortingState;
    pageIndex: number;
    columnFilters: ColumnFiltersState;
  }) => void;
};

function parseSort(raw: string | null): SortingState {
  if (!raw) return [];
  const [id, dir] = raw.split(".");
  if (!id || (dir !== "asc" && dir !== "desc")) return [];
  return [{ id, desc: dir === "desc" }];
}

function serializeSort(sorting: SortingState): string | null {
  const first = sorting[0];
  if (!first) return null;
  return `${first.id}.${first.desc ? "desc" : "asc"}`;
}

function parseFacets(raw: string | null): ColumnFiltersState {
  if (!raw) return [];
  return raw
    .split(";")
    .map((chunk) => {
      const [id, values] = chunk.split(":");
      if (!id || !values) return null;
      return { id, value: values.split(",").filter(Boolean) };
    })
    .filter((item): item is { id: string; value: string[] } => item !== null);
}

function serializeFacets(filters: ColumnFiltersState): string | null {
  const parts = filters
    .map((filter) => {
      const values = Array.isArray(filter.value)
        ? filter.value.map(String).filter(Boolean)
        : filter.value
          ? [String(filter.value)]
          : [];
      if (values.length === 0) return null;
      return `${filter.id}:${values.join(",")}`;
    })
    .filter((part): part is string => part !== null);
  return parts.length ? parts.join(";") : null;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null) {
  if (value === null || value === "") {
    params.delete(key);
    return;
  }
  params.set(key, value);
}

export function useAdminDataTableUrlState(tableId: string): AdminDataTableUrlState {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageKey = `${tableId}_page`;
  const sortKey = `${tableId}_sort`;
  const qKey = `${tableId}_q`;
  const facetsKey = `${tableId}_facets`;

  const query = searchParams.get(qKey) ?? "";
  const sorting = useMemo(() => parseSort(searchParams.get(sortKey)), [searchParams, sortKey]);
  const parsedPage = Number(searchParams.get(pageKey) ?? "1");
  const pageIndex = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) - 1 : 0;
  const columnFilters = useMemo(
    () => parseFacets(searchParams.get(facetsKey)),
    [facetsKey, searchParams],
  );

  const write = useCallback(
    (next: {
      query: string;
      sorting: SortingState;
      pageIndex: number;
      columnFilters: ColumnFiltersState;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      setOrDelete(params, qKey, next.query.trim() ? next.query : null);
      setOrDelete(params, sortKey, serializeSort(next.sorting));
      setOrDelete(params, pageKey, next.pageIndex > 0 ? String(next.pageIndex + 1) : null);
      setOrDelete(params, facetsKey, serializeFacets(next.columnFilters));
      const serialized = params.toString();
      if (serialized === searchParams.toString()) return;
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
    },
    [facetsKey, pageKey, pathname, qKey, router, searchParams, sortKey],
  );

  return { query, sorting, pageIndex, columnFilters, write };
}
