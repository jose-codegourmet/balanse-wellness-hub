"use client";

import { Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminCoachesQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function CoachListPage() {
  const { principal } = useMockPrincipal();
  const { data: rows } = useSuspenseQuery(adminCoachesQuery(principal.role));

  return (
    <AdminPageShell
      title="Coaches"
      actions={
        <Button nativeButton={false} render={<Link href="/coaches/new" />}>
          Add Coach
        </Button>
      }
    >
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
          >
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.specialties.join(" / ")} · {row.active ? "Active" : "Inactive"}
              </p>
            </div>
            <Link className="underline underline-offset-4" href={`/coaches/${row.id}`}>
              View
            </Link>
          </li>
        ))}
      </ul>
    </AdminPageShell>
  );
}
