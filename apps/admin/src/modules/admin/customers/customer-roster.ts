import type { AdminCustomer } from "@balanse/domain";

/** Named visit window for the “Active recently” roster stat. Not a magic number in JSX. */
export const CUSTOMER_RECENT_VISIT_WINDOW_DAYS = 30;

export const CUSTOMER_TABLE_ID = "customers";

export const CUSTOMER_UPCOMING_FACET = {
  yes: "Has upcoming",
  no: "None",
} as const;

export const CUSTOMER_VISITED_FACET = {
  yes: "Ever visited",
  no: "Never visited",
} as const;

export type CustomerRosterFilter = "all" | "upcoming" | "recent" | "never";

const DAY_MS = 24 * 60 * 60 * 1000;

export function isRecentlyActive(
  lastVisitAt: string | null,
  nowIso: string,
  windowDays = CUSTOMER_RECENT_VISIT_WINDOW_DAYS,
): boolean {
  if (!lastVisitAt) return false;
  const then = new Date(lastVisitAt).getTime();
  const now = new Date(nowIso).getTime();
  if (!Number.isFinite(then) || !Number.isFinite(now)) return false;
  // Inclusive of later-today session starts: lastVisitAt is the session clock, not Date.now().
  return then >= now - windowDays * DAY_MS;
}

export function customerUpcomingFacet(row: AdminCustomer): string {
  return row.upcomingCount > 0 ? CUSTOMER_UPCOMING_FACET.yes : CUSTOMER_UPCOMING_FACET.no;
}

export function customerVisitedFacet(row: AdminCustomer): string {
  return row.lastVisitAt ? CUSTOMER_VISITED_FACET.yes : CUSTOMER_VISITED_FACET.no;
}

export function deriveCustomerRosterStats(rows: AdminCustomer[], nowIso: string) {
  return {
    total: rows.length,
    withUpcoming: rows.filter((row) => row.upcomingCount > 0).length,
    activeRecently: rows.filter((row) => isRecentlyActive(row.lastVisitAt, nowIso)).length,
    neverVisited: rows.filter((row) => row.lastVisitAt == null).length,
  };
}

export function customersListHref(filter: CustomerRosterFilter = "all"): string {
  if (filter === "upcoming") {
    return `/customers?${CUSTOMER_TABLE_ID}_facets=upcoming:${CUSTOMER_UPCOMING_FACET.yes}`;
  }
  if (filter === "never") {
    return `/customers?${CUSTOMER_TABLE_ID}_facets=visited:${CUSTOMER_VISITED_FACET.no}`;
  }
  if (filter === "recent") {
    return `/customers?${CUSTOMER_TABLE_ID}_recent=1`;
  }
  return "/customers";
}

export function parseCustomerFacets(raw: string | null): Record<string, string[]> {
  if (!raw) return {};
  const next: Record<string, string[]> = {};
  for (const chunk of raw.split(";")) {
    const [id, values] = chunk.split(":");
    if (!id || !values) continue;
    next[id] = values.split(",").filter(Boolean);
  }
  return next;
}

export function activeCustomerRosterFilter(
  searchParams: Pick<URLSearchParams, "get">,
): CustomerRosterFilter {
  if (searchParams.get(`${CUSTOMER_TABLE_ID}_recent`) === "1") return "recent";
  const facets = parseCustomerFacets(searchParams.get(`${CUSTOMER_TABLE_ID}_facets`));
  const upcoming = facets.upcoming ?? [];
  const visited = facets.visited ?? [];
  if (
    upcoming.length === 1 &&
    upcoming[0] === CUSTOMER_UPCOMING_FACET.yes &&
    visited.length === 0
  ) {
    return "upcoming";
  }
  if (visited.length === 1 && visited[0] === CUSTOMER_VISITED_FACET.no && upcoming.length === 0) {
    return "never";
  }
  return "all";
}

export function customerListHasActiveFilters(searchParams: Pick<URLSearchParams, "get">): boolean {
  return Boolean(
    searchParams.get(`${CUSTOMER_TABLE_ID}_q`) ||
      searchParams.get(`${CUSTOMER_TABLE_ID}_facets`) ||
      searchParams.get(`${CUSTOMER_TABLE_ID}_recent`) === "1",
  );
}
