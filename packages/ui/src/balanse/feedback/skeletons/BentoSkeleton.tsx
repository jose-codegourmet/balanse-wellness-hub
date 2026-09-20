import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { bentoSkeletonDashboardTiles } from "./BentoSkeleton.defaults";
import type { BentoSkeletonProps, BentoSkeletonTileSpec } from "./BentoSkeleton.schema";
import { countKeys } from "./count-keys";

function resolveTiles(tiles: BentoSkeletonProps["tiles"]): BentoSkeletonTileSpec[] {
  if (Array.isArray(tiles)) return tiles;
  if (typeof tiles === "number") {
    return countKeys("tile", tiles).map((id) => ({
      id,
      span: "col-span-1 md:col-span-3 xl:col-span-3",
      variant: "stat" as const,
    }));
  }
  return bentoSkeletonDashboardTiles;
}

function TileBody({ variant }: { variant: BentoSkeletonTileSpec["variant"] }) {
  if (variant === "table") {
    return (
      <>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-3 w-56" />
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          {countKeys("row", 4).map((rowKey) => (
            <div key={rowKey} className="flex gap-3 border-b border-border/60 px-3 py-2 last:border-b-0">
              {countKeys("cell", 5).map((cellKey) => (
                <Skeleton key={cellKey} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }
  if (variant === "chart") {
    return (
      <>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-36 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {countKeys("legend", 4).map((legendKey) => (
            <Skeleton key={legendKey} className="h-3 w-full" />
          ))}
        </div>
      </>
    );
  }
  if (variant === "block") {
    return (
      <>
        <Skeleton className="h-3 w-32" />
        <div className="mt-6 space-y-4">
          {countKeys("item", 3).map((itemKey) => (
            <div key={itemKey} className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-8 h-8 w-16" />
    </>
  );
}

export function BentoSkeleton({
  label,
  tiles = bentoSkeletonDashboardTiles,
  className,
}: BentoSkeletonProps) {
  const resolved = resolveTiles(tiles);
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-40" />
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-flow-row-dense xl:grid-cols-12">
          {resolved.map((tile) => (
            <div
              key={tile.id}
              className={cn(
                "rounded-xl border border-border bg-card p-4 md:p-5",
                tile.span,
              )}
            >
              <TileBody variant={tile.variant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
