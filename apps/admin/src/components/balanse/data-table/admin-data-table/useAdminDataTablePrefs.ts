"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { AdminDataTableDensity } from "./AdminDataTable.meta";

export type AdminDataTablePrefs = {
  columnVisibility: VisibilityState;
  density: AdminDataTableDensity;
};

function prefsKey(tableId: string) {
  return `balanse-admin-table:${tableId}:prefs`;
}

const memory = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  const set = listeners.get(key);
  if (!set) return;
  for (const listener of set) listener();
}

function subscribe(key: string, onStoreChange: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      if (event.newValue == null) memory.delete(key);
      else memory.set(key, event.newValue);
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(key: string): string {
  if (memory.has(key)) return memory.get(key) ?? "";
  try {
    const raw = window.localStorage.getItem(key) ?? "";
    memory.set(key, raw);
    return raw;
  } catch {
    return "";
  }
}

function writeRaw(key: string, value: string, persist: boolean) {
  memory.set(key, value);
  if (persist) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Private mode / quota — keep in-memory prefs.
    }
  }
  emit(key);
}

function parsePrefs(raw: string, fallback: AdminDataTablePrefs): AdminDataTablePrefs {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminDataTablePrefs>;
    return {
      columnVisibility: parsed.columnVisibility ?? fallback.columnVisibility,
      density: parsed.density ?? fallback.density,
    };
  } catch {
    return fallback;
  }
}

export function useAdminDataTablePrefs(
  tableId: string,
  enabled: boolean,
  initialDensity: AdminDataTableDensity,
): [AdminDataTablePrefs, (next: Partial<AdminDataTablePrefs>) => void] {
  const key = prefsKey(tableId);
  const fallback = useMemo<AdminDataTablePrefs>(
    () => ({ columnVisibility: {}, density: initialDensity }),
    [initialDensity],
  );
  const raw = useSyncExternalStore(
    (onStoreChange) => subscribe(key, onStoreChange),
    () => readRaw(key),
    () => "",
  );
  const prefs = parsePrefs(raw, fallback);

  const update = useCallback(
    (next: Partial<AdminDataTablePrefs>) => {
      const current = parsePrefs(readRaw(key), fallback);
      writeRaw(
        key,
        JSON.stringify({
          columnVisibility: next.columnVisibility ?? current.columnVisibility,
          density: next.density ?? current.density,
        }),
        enabled,
      );
    },
    [enabled, fallback, key],
  );

  return [prefs, update];
}
