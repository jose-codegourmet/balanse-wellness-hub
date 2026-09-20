import {
  ADMIN_BOOKINGS_CURSOR_LIMIT_DEFAULT,
  ADMIN_CURSOR_LIMIT_DEFAULT,
  ADMIN_CURSOR_LIMIT_MAX,
} from "@balanse/domain";
import { ApiError } from "./errors";

type CursorPayload = {
  v: 1;
  s: string;
  k: string | null;
  i: string;
};

export function parseLimit(
  raw: string | null,
  fallback: number = ADMIN_CURSOR_LIMIT_DEFAULT,
): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) {
    throw validationCursor("limit", "limit must be a positive integer.");
  }
  return Math.min(ADMIN_CURSOR_LIMIT_MAX, Math.floor(n));
}

export function bookingsLimit(raw: string | null): number {
  return parseLimit(raw, ADMIN_BOOKINGS_CURSOR_LIMIT_DEFAULT);
}

export function encodeCursor(sort: string, key: string | null, id: string): string {
  const payload: CursorPayload = { v: 1, s: sort, k: key, i: id };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(
  raw: string | null,
  expectedSort: string,
): { key: string | null; id: string } | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as CursorPayload;
    if (parsed.v !== 1 || parsed.s !== expectedSort || typeof parsed.i !== "string") {
      throw new Error("shape");
    }
    return { key: parsed.k ?? null, id: parsed.i };
  } catch {
    throw new ApiError(400, "invalid_cursor", "Cursor is malformed or does not match this list.");
  }
}

export function cursorPage<T extends { id: string }>(
  rows: T[],
  limit: number,
  totalCount: number,
  sort: string,
  keyOf: (row: T) => string | null,
): { items: T[]; nextCursor: string | null; totalCount: number } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(sort, keyOf(last), last.id) : null,
    totalCount,
  };
}

function validationCursor(path: string, message: string): ApiError {
  return new ApiError(400, "invalid_cursor", message, {
    fieldErrors: [{ path, code: "invalid_format", message }],
  });
}
