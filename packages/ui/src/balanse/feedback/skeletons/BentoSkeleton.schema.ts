export type BentoSkeletonTileVariant = "stat" | "block" | "table" | "chart";

export type BentoSkeletonTileSpec = {
  id: string;
  span: string;
  variant?: BentoSkeletonTileVariant;
};

export type BentoSkeletonProps = {
  label: string;
  tiles?: number | BentoSkeletonTileSpec[];
  className?: string;
};
