export type TablePageSkeletonLeadingCell = "bar" | "avatar";

export type TablePageSkeletonProps = {
  label: string;
  rows?: number;
  columns?: number;
  className?: string;
  /** First-column shape. Use `avatar` on photo rosters such as `/coaches`. */
  leadingCell?: TablePageSkeletonLeadingCell;
};
