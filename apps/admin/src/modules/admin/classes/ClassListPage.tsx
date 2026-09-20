"use client";

import { Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminClassesQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function ClassListPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminClassesQuery(principal.role));
  const rows = empty ? [] : query.data;

  return (
    <AdminPageShell
      title="Classes"
      actions={
        <Button nativeButton={false} render={<Link href="/classes/new" />}>
          Add Class
        </Button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classes yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted-foreground">
                  {row.active ? "Active" : "Inactive"}
                </p>
              </div>
              <Link className="underline underline-offset-4" href={`/classes/${row.id}`}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminPageShell>
  );
}
