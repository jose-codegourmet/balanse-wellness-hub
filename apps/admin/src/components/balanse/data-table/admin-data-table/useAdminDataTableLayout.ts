"use client";

import { type RefCallback, useCallback, useLayoutEffect, useRef, useState } from "react";
import type { AdminDataTableLayout } from "./AdminDataTable.meta";

/**
 * Container width (px) below which `layout="auto"` renders cards without measuring content. 64rem:
 * every list is a card list on an iPad (portrait and landscape) and beside an expanded sidebar on
 * a 1280px laptop (913px column); a collapsed rail (1125px) or a wider screen gets the table.
 */
export const ADMIN_DATA_TABLE_CARDS_BELOW = 1024;

/**
 * Resize events are debounced by this much. The sidebar's width transition (300ms) fires
 * ResizeObserver every frame; without this each frame re-rendered the whole table and could
 * flip table ↔ cards mid-animation. The first measurement is still synchronous.
 */
const RESIZE_SETTLE_MS = 120;

/**
 * Container-based table/cards switch. The sidebar changes the content width without changing the
 * viewport, so `auto` measures the table's own section (ResizeObserver), never the screen: cards
 * when the section is narrower than `cardsBelow`, or when the table would scroll horizontally
 * inside it. The overflow probe runs in a layout effect so the swap lands before paint.
 *
 * A measured overflow is remembered for that container width (and narrower) so paging to a page
 * with shorter content does not flip the layout back and forth. It is forgotten when `resetKey`
 * changes (visible columns, density) or the container grows past it.
 */
export function useAdminDataTableLayout({
  layout,
  cardsBelow = ADMIN_DATA_TABLE_CARDS_BELOW,
  resetKey,
}: {
  layout: AdminDataTableLayout;
  cardsBelow?: number;
  resetKey: string;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [overflowAt, setOverflowAt] = useState<number | null>(null);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setOverflowAt(null);
  }

  const containerRef = useCallback<RefCallback<HTMLElement>>((node) => setContainer(node), []);

  useLayoutEffect(() => {
    if (!container) return;
    setContainerWidth(container.getBoundingClientRect().width);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver((entries) => {
      // contentRect comes with the entry: no forced layout. The section has no padding or
      // border, so it equals the bounding width.
      const width = entries[0]?.contentRect.width;
      if (width === undefined) return;
      clearTimeout(timer);
      timer = setTimeout(() => setContainerWidth(width), RESIZE_SETTLE_MS);
    });
    observer.observe(container);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [container]);

  const cardMode =
    layout === "cards"
      ? true
      : layout === "table"
        ? false
        : containerWidth === null ||
          containerWidth < cardsBelow ||
          (overflowAt !== null && containerWidth <= overflowAt);

  // Probe after every table-mode commit: two layout reads, and `setOverflowAt` bails out when
  // the value is unchanged, so this cannot loop.
  useLayoutEffect(() => {
    if (cardMode || containerWidth === null) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollWidth > scroller.clientWidth + 1) setOverflowAt(containerWidth);
  });

  return { containerRef, scrollerRef, cardMode };
}
