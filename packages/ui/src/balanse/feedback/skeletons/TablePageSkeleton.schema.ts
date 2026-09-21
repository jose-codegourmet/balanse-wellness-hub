export type TablePageSkeletonLeadingCell = "bar" | "avatar";

/** Same contract as `AdminDataTable` `layout`. */
export type TablePageSkeletonLayout = "auto" | "table" | "cards";

export type TablePageSkeletonChrome = "page" | "content";

export type TablePageSkeletonProps = {
  label: string;
  rows?: number;
  /**
   * Table-mode column count. In card mode this is how many labelled meta
   * rows appear under the title/subtitle (clamped 0–3). It does not become
   * extra cards.
   */
  columns?: number;
  className?: string;
  /** First-column / card-title shape. Use `avatar` on photo rosters such as `/coaches`. */
  leadingCell?: TablePageSkeletonLeadingCell;
  /**
   * `auto` follows `useBreakpoint()` (cards below tablet). Pin `table` or
   * `cards` in Storybook and in `AdminDataTable`'s loading state.
   */
  layout?: TablePageSkeletonLayout;
  /**
   * `page` includes the list-header chrome used by route `loading.tsx`.
   * `content` is toolbar + list only, matching `AdminDataTable` after a real title.
   */
  chrome?: TablePageSkeletonChrome;
};
