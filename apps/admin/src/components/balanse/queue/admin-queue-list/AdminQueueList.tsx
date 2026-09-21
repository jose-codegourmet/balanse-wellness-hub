"use client";

import { Button, CardListSkeleton, cn, FeedbackState } from "@balanse/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type FocusEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { AdminQueueListProps } from "./AdminQueueList.schema";

const DEFAULT_ESTIMATE = 168;
const DEFAULT_THRESHOLD = 30;
const SCROLL_STORAGE_PREFIX = "balanse:admin-queue-scroll:";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function AdminQueueList<T>({
  items,
  renderItem,
  getItemKey,
  estimateSize = DEFAULT_ESTIMATE,
  totalCount,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  nextPageError,
  loading = false,
  error,
  empty,
  label,
  virtualizeThreshold = DEFAULT_THRESHOLD,
  className,
}: AdminQueueListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastFocusedKeyRef = useRef<string | null>(null);
  const prevCountRef = useRef(items.length);
  const [liveMessage, setLiveMessage] = useState("");
  const reducedMotion = usePrefersReducedMotion();
  const setSize = totalCount ?? items.length;
  const virtualized = items.length >= virtualizeThreshold;
  const storageKey = `${SCROLL_STORAGE_PREFIX}${label}`;

  const virtualizer = useVirtualizer({
    count: virtualized ? items.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    measureElement:
      typeof window !== "undefined"
        ? (element) => element.getBoundingClientRect().height
        : undefined,
    overscan: reducedMotion ? 2 : 8,
    enabled: virtualized,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) el.scrollTop = Number(saved);
    } catch {
      // sessionStorage may be unavailable
    }
    const onScroll = () => {
      try {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      } catch {
        // ignore quota / private mode
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [storageKey]);

  useEffect(() => {
    if (items.length > prevCountRef.current) {
      const added = items.length - prevCountRef.current;
      setLiveMessage(`${added} more requests loaded`);
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  useLayoutEffect(() => {
    const key = lastFocusedKeyRef.current;
    if (!key) return;
    const stillPresent = items.some((item, index) => getItemKey(item, index) === key);
    const region = scrollRef.current;
    if (!stillPresent && region && !region.contains(document.activeElement)) {
      region.focus();
    }
  }, [getItemKey, items]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage?.();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = virtualized ? scrollRef.current : null;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root, rootMargin: "160px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadMore, virtualized, items.length]);

  const recordFocus = (event: FocusEvent<HTMLElement>) => {
    const item = (event.target as HTMLElement).closest("[data-queue-item-key]");
    const key = item?.getAttribute("data-queue-item-key");
    if (key) lastFocusedKeyRef.current = key;
  };

  if (loading && items.length === 0) {
    return <CardListSkeleton label={label} items={3} className={className} />;
  }

  if (error && items.length === 0) {
    return <div className={className}>{error}</div>;
  }

  if (!loading && items.length === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <FeedbackState
            id="admin.no-pending-payments"
            title="No requests in this queue"
            description="New requests will appear here as they come in."
          />
        )}
      </div>
    );
  }

  const renderRow = (item: T, index: number) => {
    const key = getItemKey(item, index);
    return (
      <li key={key} data-queue-item-key={key} aria-setsize={setSize} aria-posinset={index + 1}>
        {renderItem(item, index)}
      </li>
    );
  };

  const pager = (
    <div className="mt-4 flex flex-col items-start gap-3">
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {nextPageError ? <div>{nextPageError}</div> : null}
      {hasNextPage || isFetchingNextPage ? (
        <Button type="button" variant="outline" loading={isFetchingNextPage} onClick={loadMore}>
          Load more
        </Button>
      ) : null}
    </div>
  );

  if (!virtualized) {
    return (
      <div className={cn("w-full", className)}>
        <section
          ref={scrollRef}
          aria-label={label}
          onFocusCapture={recordFocus}
          className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ul className="space-y-4">{items.map((item, index) => renderRow(item, index))}</ul>
          {pager}
        </section>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className={cn("w-full", className)}>
      <section
        ref={scrollRef}
        aria-label={label}
        // Windowed items leave the DOM; the scroller must stay keyboard-reachable.
        // biome-ignore lint/a11y/noNoninteractiveTabindex: virtualized queue scroller
        tabIndex={0}
        onFocusCapture={recordFocus}
        className="max-h-[70vh] overflow-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ul className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index];
            if (!item) return null;
            const key = getItemKey(item, virtualRow.index);
            return (
              <li
                key={key}
                data-index={virtualRow.index}
                data-queue-item-key={key}
                ref={virtualizer.measureElement}
                aria-setsize={setSize}
                aria-posinset={virtualRow.index + 1}
                className="absolute top-0 left-0 w-full pb-4"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {renderItem(item, virtualRow.index)}
              </li>
            );
          })}
        </ul>
        {pager}
      </section>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

export type { AdminQueueListProps };
