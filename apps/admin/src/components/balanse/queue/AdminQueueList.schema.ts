import type * as React from "react";

export type AdminQueueListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string;
  estimateSize?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  nextPageError?: React.ReactNode;
  loading?: boolean;
  error?: React.ReactNode;
  empty?: React.ReactNode;
  label: string;
  virtualizeThreshold?: number;
  className?: string;
};
