"use client";

import {
  type AdminCustomer,
  formatRelativeTime,
  formatSessionDate,
  ONBOARDING_STATUS_LABELS,
} from "@balanse/domain";
import { Badge, Button, FeedbackState, UserAvatar } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarClock,
  Clock,
  CopyIcon,
  EyeOffIcon,
  type LucideIcon,
  UserMinus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import type { AdminDataTableRowAction } from "@/components/balanse/data-table/admin-data-table/AdminDataTable.meta";
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
} from "../../_lib/customer-roster";
import type { CustomerListPageProps } from "./CustomerListPage.meta";

export type { CustomerListPageProps } from "./CustomerListPage.meta";

/** Name cell: avatar, full name, nickname subtitle, and the public-roster opt-out mark. */
function CustomerNameCell({ customer }: { customer: AdminCustomer }) {
  const nickname = customer.nickname?.trim();
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="shrink-0">
        <UserAvatar
          name={{ firstName: customer.firstName, lastName: customer.lastName }}
          avatarUrl={customer.avatarUrl}
          seed={customer.id}
          size="lg"
        />
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2">{customer.fullName}</span>
        {nickname || !customer.showOnPublicRoster ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            {nickname ? <span className="italic">{nickname}</span> : null}
            {customer.showOnPublicRoster ? null : (
              <span className="inline-flex items-center gap-1" title="Hidden on public roster">
                <EyeOffIcon aria-hidden className="size-3" />
                <span className="sr-only">Hidden on public roster</span>
              </span>
            )}
          </span>
        ) : null}
      </span>
    </span>
  );
}

function CopyableText({ value }: { value: string }) {
  return (
    <span className="flex max-w-full min-w-0 items-center gap-1">
      <span className="truncate">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        title={`Copy ${value}`}
        aria-label={`Copy ${value}`}
        onClick={() => {
          void navigator.clipboard.writeText(value);
        }}
      >
        <CopyIcon aria-hidden />
      </Button>
    </span>
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
          "group flex h-full min-h-0 flex-col rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-[transform,box-shadow,background-color] md:p-5",
          "hover:-translate-y-0.5 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none",
          active && "border-primary/30 bg-primary text-primary-foreground shadow-md ring-0",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            active && "text-primary-foreground/75",
          )}
        >
          <span
            className={cn(
              "grid size-8 place-items-center rounded-lg bg-muted",
              active && "bg-primary-foreground/10",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          {label}
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
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
    adminCustomersQuery(principal, upcomingOnly ? { hasUpcoming: true } : undefined),
  );
  const rosterQuery = useSuspenseQuery(adminCustomersQuery(principal));

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
        id: "fullName",
        header: "Name",
        // Search matches nickname too: the global filter reads this accessor.
        accessorFn: (row) => [row.fullName, row.nickname].filter(Boolean).join(" "),
        sortingFn: (a, b) => a.original.fullName.localeCompare(b.original.fullName),
        cell: ({ row }) => <CustomerNameCell customer={row.original} />,
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
        id: "onboarding",
        header: "Onboarding",
        accessorFn: (row) => ONBOARDING_STATUS_LABELS[row.onboardingStatus],
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Onboarding", mobile: { role: "meta" } },
        cell: ({ row }) => (
          <Badge
            appearance="soft"
            size="sm"
            variant={row.original.onboardingStatus === "completed" ? "success" : "neutral"}
          >
            {ONBOARDING_STATUS_LABELS[row.original.onboardingStatus]}
          </Badge>
        ),
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
      eyebrow="Customer care"
      title="Customers"
      description={`Find contact details, upcoming bookings, and visit history. “Active recently” means a visit within ${CUSTOMER_RECENT_VISIT_WINDOW_DAYS} days.`}
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
        searchPlaceholder="Search name, nickname, email, or phone"
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
