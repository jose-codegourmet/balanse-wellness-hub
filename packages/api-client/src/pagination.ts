import type { CursorPage } from "@balanse/domain";

/**
 * `getNextPageParam` for `useInfiniteQuery` consuming a `CursorPage<T>`
 * (BE-050 admin queues, WIRE-0103, #356).
 */
export function getNextCursorParam<T>(lastPage: CursorPage<T>): string | undefined {
  return lastPage.nextCursor ?? undefined;
}

export type PageWindow = {
  page: number;
  pageSize: number;
  total: number;
};

/** Total page count for a `{page, pageSize, total}` envelope (customers/sessions lists). */
export function pageCount(window: Pick<PageWindow, "pageSize" | "total">): number {
  if (window.pageSize <= 0) return 0;
  return Math.ceil(window.total / window.pageSize);
}

export function hasNextPage(window: PageWindow): boolean {
  return window.page < pageCount(window);
}

/** The required `from`/`to` window limit for public sessions and reports (BE-022/BE-345). */
export const MAX_DATE_WINDOW_DAYS = 366;

export class DateWindowTooLargeError extends Error {
  readonly days: number;

  constructor(days: number) {
    super(`Date window spans ${days} days; the limit is ${MAX_DATE_WINDOW_DAYS}.`);
    this.name = "DateWindowTooLargeError";
    this.days = days;
  }
}

/** Throws `DateWindowTooLargeError` when `to - from` exceeds `MAX_DATE_WINDOW_DAYS`. */
export function assertDateWindow(from: string, to: string): void {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24);
  if (days > MAX_DATE_WINDOW_DAYS) {
    throw new DateWindowTooLargeError(days);
  }
}
