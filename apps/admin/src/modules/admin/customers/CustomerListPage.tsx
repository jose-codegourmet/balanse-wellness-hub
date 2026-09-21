"use client";

import { type AdminCustomer, formatRelativeTime, formatSessionDate } from "@balanse/domain";
import { Badge, Button, FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Clock, type LucideIcon, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import type { AdminDataTableRowAction } from "@/components/balanse/data-table/admin-data-table/AdminDataTable.schema";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { adminCustomersQuery } from "@/lib/query/queries";
import { cn } from "@/lib/utils";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  activeCustomerRosterFilter,
  CUSTOMER_RECENT_VISIT_WINDOW_DAYS,
  CUSTOMER_TABLE_ID,
  type CustomerRosterFilter,
  customersListHref,
  customerUpcomingFacet,
  customerVisitedFacet,
  deriveCustomerRosterStats,
  isRecentlyActive,
  parseCustomerFacets,
} from "./customer-roster";

export type CustomerListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  focusCustomerId?: string;
};

function CopyableText({ value }: { value: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="h-auto max-w-full justify-start px-1.5 py-0.5 font-normal"
      title={`Copy ${value}`}
      aria-label={`Copy ${value}`}
      onClick={() => {
        void navigator.clipboard.writeText(value);
      }}
    >
      <span className="truncate">{value}</span>
    </Button>
  );
}

function CustomerStatTile({
  href,
  label,
  value,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  value: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <article>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-full min-h-0 flex-col rounded-xl border border-border bg-card p-4 md:p-5",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "bg-muted/40 ring-2 ring-ring",
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          {label}
        </div>
        <p className="mt-6 text-3xl font-light tracking-tight tabular-nums">{value}</p>
      </Link>
    </article>
  );
}

function CustomerListPageInner({ empty, loading, error, focusCustomerId }: CustomerListPageProps) {
  const { principal } = useMockPrincipal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nowIso = adminNowIso();
  const activeFilter = activeCustomerRosterFilter(searchParams);
  const facets = parseCustomerFacets(searchParams.get(`${CUSTOMER_TABLE_ID}_facets`));
  const upcomingOnly = (facets.upcoming ?? []).includes("Has upcoming");
  const listQuery = useSuspenseQuery(
    adminCustomersQuery(principal.role, upcomingOnly ? { hasUpcoming: true } : undefined),
  );
  const rosterQuery = useSuspenseQuery(adminCustomersQuery(principal.role));

  const roster = useMemo(() => {
    const next = empty ? [] : rosterQuery.data;
    return focusCustomerId ? next.filter((row) => row.id === focusCustomerId) : next;
  }, [empty, focusCustomerId, rosterQuery.data]);

  const rows = useMemo(() => {
    const source = empty ? [] : listQuery.data;
    const scoped = focusCustomerId ? source.filter((row) => row.id === focusCustomerId) : source;
    if (searchParams.get(`${CUSTOMER_TABLE_ID}_recent`) === "1") {
      return scoped.filter((row) => isRecentlyActive(row.lastVisitAt, nowIso));
    }
    return scoped;
  }, [empty, focusCustomerId, listQuery.data, nowIso, searchParams]);

  const stats = deriveCustomerRosterStats(roster, nowIso);

  const columns = useMemo<ColumnDef<AdminCustomer, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        meta: { primaryLink: (row) => `/customers/${row.id}`, mobile: { role: "title" } },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { mobile: { role: "subtitle" } },
        cell: ({ row }) => <CopyableText value={row.original.email} />,
      },
      {
        accessorKey: "contactNumber",
        header: "Phone",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => <CopyableText value={row.original.contactNumber} />,
      },
      {
        id: "upcoming",
        header: "Upcoming",
        accessorFn: customerUpcomingFacet,
        enableColumnFilter: true,
        enableGlobalFilter: false,
        sortingFn: (a, b) => a.original.upcomingCount - b.original.upcomingCount,
        meta: { enableFaceting: true, facetLabel: "Has upcoming", mobile: { role: "status" } },
        cell: ({ row }) => {
          const count = row.original.upcomingCount;
          return (
            <Badge
              variant={count > 0 ? "info" : "neutral"}
              appearance={count > 0 ? "solid" : "soft"}
              size="sm"
              aria-label={`${count} upcoming`}
            >
              {count}
            </Badge>
          );
        },
      },
      {
        id: "visited",
        header: "Last Visit",
        accessorFn: customerVisitedFacet,
        enableColumnFilter: true,
        enableGlobalFilter: false,
        sortingFn: (a, b) =>
          (a.original.lastVisitAt ?? "").localeCompare(b.original.lastVisitAt ?? ""),
        meta: { enableFaceting: true, facetLabel: "Ever visited", mobile: { role: "meta" } },
        cell: ({ row }) => {
          const iso = row.original.lastVisitAt;
          if (!iso) return "—";
          const relative = formatRelativeTime(iso, nowIso);
          return (
            <div>
              <p>{formatSessionDate(iso)}</p>
              {relative ? <p className="text-xs text-muted-foreground">{relative}</p> : null}
            </div>
          );
        },
      },
    ],
    [nowIso],
  );

  const rowActions = useCallback(
    (row: AdminCustomer): AdminDataTableRowAction<AdminCustomer>[] => [
      {
        id: "view",
        label: "View",
        href: `/customers/${row.id}`,
      },
    ],
    [],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname || "/customers", { scroll: false });
  }, [pathname, router]);

  const tiles: {
    id: CustomerRosterFilter;
    label: string;
    value: string;
    icon: LucideIcon;
  }[] = [
    { id: "all", label: "Total customers", value: String(stats.total), icon: Users },
    {
      id: "upcoming",
      label: "With upcoming bookings",
      value: String(stats.withUpcoming),
      icon: CalendarClock,
    },
    {
      id: "recent",
      label: "Active recently",
      value: String(stats.activeRecently),
      icon: Clock,
    },
    {
      id: "never",
      label: "Never visited",
      value: String(stats.neverVisited),
      icon: UserMinus,
    },
  ];

  return (
    <AdminPageShell
      title="Customers"
      description={`Roster counts from the customer list. Active recently is a last visit within ${CUSTOMER_RECENT_VISIT_WINDOW_DAYS} days.`}
      stats={
        <div data-slot="customer-stats" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {tiles.map((tile) => (
            <CustomerStatTile
              key={tile.id}
              href={customersListHref(tile.id)}
              label={tile.label}
              value={tile.value}
              icon={tile.icon}
              active={activeFilter === tile.id}
            />
          ))}
        </div>
      }
    >
      <AdminDataTable
        tableId={CUSTOMER_TABLE_ID}
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search name, email, or phone"
        empty={
          <FeedbackState
            id="admin.no-customers"
            onAction={() => {
              clearFilters();
            }}
          />
        }
        emptyFilterLabel="No customers match your filter."
        persistUrl
        loading={loading}
        loadingLabel="Loading customers"
        error={
          error ? (
            <p className="text-sm text-muted-foreground">Customers could not be loaded.</p>
          ) : undefined
        }
        rowActions={rowActions}
      />
    </AdminPageShell>
  );
}

export function CustomerListPage(props: CustomerListPageProps) {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Customers">
          <p className="text-sm text-muted-foreground">Loading customers</p>
        </AdminPageShell>
      }
    >
      <CustomerListPageInner {...props} />
    </Suspense>
  );
}
