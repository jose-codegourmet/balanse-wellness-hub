import { Badge } from "@balanse/ui";
import Link from "next/link";
import { DashboardTile } from "./DashboardTile";
import type { NeedsAttentionTileProps } from "./NeedsAttentionTile.schema";

export function NeedsAttentionTile({ items }: NeedsAttentionTileProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const allClear = total === 0;

  return (
    <DashboardTile span="attention" aria-labelledby="needs-attention-heading">
      <p
        id="needs-attention-heading"
        className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase"
      >
        Needs Attention
      </p>
      {allClear ? (
        <p className="mt-6 text-lg text-muted-foreground">All clear — nothing waiting for review.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => {
            const urgent = item.count > 0;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-start justify-between gap-3 py-3 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {urgent ? item.waitingLabel : item.clearLabel}
                    </span>
                  </span>
                  {urgent ? (
                    <Badge variant="warning" appearance="solid" size="sm">
                      {item.count}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" appearance="soft" size="sm">
                      0
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardTile>
  );
}
