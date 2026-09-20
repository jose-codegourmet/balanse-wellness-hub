"use client";

import {
  AlarmClock,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeHelp,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Command,
  Download,
  File,
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  Link2,
  type LucideIcon,
  Menu,
  MessageSquareMore,
  Moon,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  TriangleAlert,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { cn } from "@/components/jabkit/lib/cn";
import { portfolioDashboardMocks } from "./PortfolioDashboard.mocks";
import type {
  PortfolioDashboardAlert,
  PortfolioDashboardNavIcon,
  PortfolioDashboardPageId,
  PortfolioDashboardProps,
  PortfolioDashboardTone,
  PortfolioDashboardTrend,
} from "./PortfolioDashboard.types";

const defaults = portfolioDashboardMocks.default;

const navIcons: Record<PortfolioDashboardNavIcon, LucideIcon> = {
  overview: LayoutGrid,
  threads: MessageSquareMore,
  documents: FileText,
  claims: BadgeHelp,
  renewals: RefreshCcw,
  clients: UsersRound,
  shared: FolderOpen,
  integrations: Link2,
  settings: Settings,
};

const toneBadge: Record<PortfolioDashboardTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-primary",
  muted: "bg-muted text-muted-foreground",
};

const toneFill: Record<PortfolioDashboardTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  primary: "bg-primary",
  muted: "bg-muted-foreground",
};

const trendTone: Record<
  PortfolioDashboardTrend,
  { text: string; bar: string; Icon: LucideIcon }
> = {
  up: {
    text: "text-success",
    bar: "bg-success/30 last:bg-success",
    Icon: ArrowUpRight,
  },
  down: {
    text: "text-destructive",
    bar: "bg-destructive/30 last:bg-destructive",
    Icon: ArrowDownRight,
  },
  stable: {
    text: "text-primary",
    bar: "bg-primary/30 last:bg-primary",
    Icon: ArrowRight,
  },
};

const statIcons = [ShieldCheck, WalletCards, File, RefreshCcw] as const;

function meterTicks(count: number, prefix: string) {
  return Array.from({ length: count }, (_, slot) => ({
    id: `${prefix}-${slot + 1}`,
    slot,
  }));
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function BrandMark({ brand }: { brand: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
      >
        <span className="absolute inset-[5px] rounded-full border-2 border-primary-foreground/70" />
        <span className="size-1.5 rounded-full bg-primary-foreground" />
      </span>
      <span className="text-xl font-semibold tracking-tight">{brand}</span>
    </div>
  );
}

function SoftButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-card px-3 text-sm font-medium text-foreground shadow-sm ring-1 ring-border outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-colors",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground shadow-[inset_0_1px_0_0_var(--color-primary-foreground)] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-[filter,transform] motion-safe:active:scale-[0.98]",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function Plate({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PortfolioDashboard({
  className,
  brand = defaults.brand,
  greeting = defaults.greeting,
  searchPlaceholder = defaults.searchPlaceholder,
  user = defaults.user,
  navGroups = defaults.navGroups,
  alerts = defaults.alerts,
  stats = defaults.stats,
  policies = defaults.policies,
  insights = defaults.insights,
  activities = defaults.activities,
  renewals = defaults.renewals,
  riskRows = defaults.riskRows,
  notifications = defaults.notifications,
  threads = defaults.threads,
  documents = defaults.documents,
  claims = defaults.claims,
  clients = defaults.clients,
  integrations = defaults.integrations,
  usage = defaults.usage,
  policyCountLabel = defaults.policyCountLabel,
  initialPage = "overview",
  ...props
}: PortfolioDashboardProps) {
  const searchId = useId();
  const reducedMotion = useReducedMotion();
  const [page, setPage] = useState<PortfolioDashboardPageId>(initialPage);
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [showUsage, setShowUsage] = useState(true);
  const [filters, setFilters] = useState({
    active: true,
    pending: false,
    highRisk: true,
    claims: false,
  });

  const visiblePolicies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return policies.filter((policy) => {
      const status = policy.status.toLowerCase();
      const matchesQuery =
        !needle ||
        policy.name.toLowerCase().includes(needle) ||
        policy.type.toLowerCase().includes(needle) ||
        status.includes(needle);
      if (!matchesQuery) return false;
      if (filters.claims && status !== "claim") return false;
      if (filters.pending && status !== "pending") return false;
      return true;
    });
  }, [filters.claims, filters.pending, policies, query]);

  const pageTitle =
    navGroups.flatMap((group) => group.items).find((item) => item.id === page)
      ?.label ?? "Portfolio Overview";

  return (
    <div
      className={cn(
        "flex min-h-dvh bg-background font-sans text-foreground",
        dark && "dark",
        className,
      )}
      data-slot="portfolio-dashboard"
      {...props}
    >
      {navOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setNavOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background md:static md:z-0",
          navOpen ? "flex" : "hidden md:flex",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <BrandMark brand={brand} />
          <button
            aria-label="Close navigation"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted md:hidden"
            onClick={() => setNavOpen(false)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-5">
          {navGroups.map((group) => (
            <div className="pb-5" key={group.label}>
              <p className="px-3 text-xs font-normal text-muted-foreground">
                {group.label}
              </p>
              <ul className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const Icon = navIcons[item.icon];
                  const active = item.id === page;
                  return (
                    <li key={item.id}>
                      <button
                        className={cn(
                          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-card text-primary shadow-sm ring-1 ring-border"
                            : "text-foreground hover:bg-muted",
                        )}
                        onClick={() => {
                          setPage(item.id);
                          setNavOpen(false);
                        }}
                        type="button"
                      >
                        <Icon
                          className={cn(
                            "size-5",
                            active ? "text-primary" : "text-foreground",
                          )}
                        />
                        <span className={active ? "text-primary" : undefined}>
                          {item.label}
                        </span>
                        {item.count ? (
                          <span className="ml-auto rounded-sm bg-card px-2 py-0.5 text-xs text-foreground shadow-sm ring-1 ring-border">
                            {item.count}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-4 p-4">
          {showUsage ? (
            <Plate className="flex flex-col gap-4 p-4">
              <div className="flex justify-end">
                <button
                  aria-label="Dismiss usage card"
                  className="grid size-8 place-items-center rounded-lg shadow-sm ring-1 ring-border outline-none hover:bg-muted"
                  onClick={() => setShowUsage(false)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex justify-between text-sm">
                <span>{usage.label}</span>
                <strong className="font-medium tabular-nums">
                  {usage.current}/{usage.limit}
                </strong>
              </div>
              <div className="flex gap-1">
                {meterTicks(usage.total, usage.label).map((tick) => (
                  <span
                    className={cn(
                      "h-4 w-1 rounded-full",
                      tick.slot < usage.filled ? "bg-primary" : "bg-muted",
                    )}
                    key={tick.id}
                  />
                ))}
              </div>
              <PrimaryButton>
                Upgrade plan <ArrowUpRight className="size-4" />
              </PrimaryButton>
            </Plate>
          ) : null}

          <div className="space-y-1">
            <button
              className="flex h-10 w-full items-center justify-start gap-3 rounded-xl px-2 text-sm text-muted-foreground outline-none hover:bg-muted"
              type="button"
            >
              <HelpCircle className="size-5" />
              Help
            </button>
            <button
              className="flex h-10 w-full items-center justify-start gap-3 rounded-xl px-2 text-sm text-muted-foreground outline-none hover:bg-muted"
              onClick={() => setDark((value) => !value)}
              type="button"
            >
              <span className="relative size-5">
                <Sun
                  className={cn(
                    "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
                    dark ? "scale-50 opacity-0" : "scale-100 opacity-100",
                  )}
                />
                <Moon
                  className={cn(
                    "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
                    dark ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                />
              </span>
              Dark Mode
            </button>
            <button
              className="flex h-10 w-full items-center justify-start gap-3 rounded-xl px-2 text-sm text-muted-foreground outline-none hover:bg-muted"
              onClick={() => setPage("settings")}
              type="button"
            >
              <UserRound className="size-5" />
              Profile
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border outline-none md:hidden"
            onClick={() => setNavOpen(true)}
            type="button"
          >
            <Menu className="size-4" />
          </button>
          <h1 className="text-base font-semibold">
            {page === "overview" ? "Portfolio Overview" : pageTitle}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <label className="sr-only" htmlFor={searchId}>
                Search
              </label>
              <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
              <input
                className="h-10 w-72 rounded-xl bg-card pr-16 pl-9 text-sm shadow-sm ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
                id={searchId}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                value={query}
              />
              <kbd className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-sm bg-card px-1 text-sm text-muted-foreground shadow-sm ring-1 ring-border">
                <Command className="size-3" /> K
              </kbd>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border outline-none"
              >
                <Bell className="size-4" />
                <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-destructive" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <span className="text-xs font-normal text-muted-foreground">
                    {notifications.length} unread
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((item) => (
                  <DropdownMenuItem
                    className="flex flex-col items-start gap-1 p-3 whitespace-normal"
                    key={item.id}
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                    <span className="mt-1 text-[10px] text-muted-foreground">
                      {item.time}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-center text-sm text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-card px-2 shadow-sm ring-1 ring-border outline-none">
                <Avatar size="sm">
                  {user.image ? <AvatarImage alt="" src={user.image} /> : null}
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPage("settings")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPage("settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-8",
            !reducedMotion &&
              "motion-safe:animate-[portfolio-in_420ms_cubic-bezier(0.16,1,0.3,1)]",
          )}
        >
          {page === "overview" ? (
            <OverviewPage
              alerts={alerts}
              filters={filters}
              insights={insights}
              policies={visiblePolicies}
              policyCountLabel={policyCountLabel}
              greeting={greeting}
              stats={stats}
              activities={activities}
              renewals={renewals}
              riskRows={riskRows}
              onFilterChange={(key, value) =>
                setFilters((current) => ({ ...current, [key]: value }))
              }
            />
          ) : null}
          {page === "policy-threads" ? (
            <ListPage
              title="Policy Threads"
              subtitle="Conversations attached to live policies and claims."
            >
              <Plate className="divide-y divide-border">
                {threads.map((thread) => (
                  <div className="flex items-start gap-4 p-4" key={thread.id}>
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm text-primary">
                      {thread.client.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{thread.title}</p>
                        {thread.unread ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {thread.unread}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {thread.client}
                      </p>
                      <p className="mt-1 text-sm">{thread.preview}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {thread.updated}
                    </span>
                  </div>
                ))}
              </Plate>
            </ListPage>
          ) : null}
          {page === "documents" ? (
            <ListPage
              title="Documents"
              subtitle="Policy packs, surveys, and claim files in the shared book."
            >
              <Plate className="divide-y divide-border">
                {documents.map((document) => (
                  <div
                    className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto]"
                    key={document.id}
                  >
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {document.kind}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {document.owner}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {document.updated}
                    </p>
                  </div>
                ))}
              </Plate>
            </ListPage>
          ) : null}
          {page === "claims-hub" ? (
            <ListPage
              title="Claims Hub"
              subtitle="Open and settled claims across the book."
            >
              <Plate className="divide-y divide-border">
                {claims.map((claim) => (
                  <div
                    className="grid items-center gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto]"
                    key={claim.id}
                  >
                    <span className="font-mono text-sm">{claim.reference}</span>
                    <div>
                      <p className="font-medium">{claim.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {claim.type}
                      </p>
                    </div>
                    <span className="tabular-nums">{claim.amount}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        toneBadge[claim.tone],
                      )}
                    >
                      {claim.status}
                    </span>
                  </div>
                ))}
              </Plate>
            </ListPage>
          ) : null}
          {page === "renewals" ? (
            <ListPage
              title="Renewals"
              subtitle="Upcoming expiries that still need a broker decision."
            >
              <RenewalsList renewals={renewals} />
            </ListPage>
          ) : null}
          {page === "clients" ? (
            <ListPage
              title="Clients"
              subtitle="Accounts in the shared book of business."
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {clients.map((client) => (
                  <Plate className="p-4" key={client.id}>
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm text-primary">
                      {client.initials}
                    </span>
                    <h3 className="mt-4 text-lg font-medium">{client.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {client.book}
                    </p>
                    <p className="mt-3 text-sm tabular-nums">
                      {client.policies} policies
                    </p>
                  </Plate>
                ))}
              </div>
            </ListPage>
          ) : null}
          {page === "shared-portfolio" ? (
            <ListPage
              title="Shared Portfolio"
              subtitle="Policies visible to the wider brokerage desk."
            >
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {policies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </ListPage>
          ) : null}
          {page === "integrations" ? (
            <ListPage
              title="Integrations"
              subtitle="Carrier and operations connections for this workspace."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {integrations.map((item) => (
                  <Plate
                    className="flex items-center justify-between p-4"
                    key={item.id}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.status}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        item.connected ? toneBadge.success : toneBadge.warning,
                      )}
                    >
                      {item.connected ? "Connected" : "Paused"}
                    </span>
                  </Plate>
                ))}
              </div>
            </ListPage>
          ) : null}
          {page === "settings" ? (
            <ListPage
              title="Settings"
              subtitle="Workspace profile and appearance for this broker desk."
            >
              <Plate className="grid gap-4 p-5 md:max-w-xl">
                <label className="grid gap-2 text-sm">
                  Display name
                  <input
                    className="h-10 rounded-xl bg-background px-3 shadow-sm ring-1 ring-border outline-none"
                    defaultValue={user.name}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Email
                  <input
                    className="h-10 rounded-xl bg-background px-3 shadow-sm ring-1 ring-border outline-none"
                    defaultValue={user.email}
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Role: {user.role ?? "Broker"}
                </p>
                <PrimaryButton className="w-fit">Save profile</PrimaryButton>
              </Plate>
            </ListPage>
          ) : null}
        </main>
      </div>
      <style>
        {`@keyframes portfolio-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){@keyframes portfolio-in{from{opacity:1;transform:none}to{opacity:1;transform:none}}}`}
      </style>
    </div>
  );
}

function ListPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function OverviewPage({
  greeting,
  alerts,
  stats,
  policies,
  insights,
  activities,
  renewals,
  riskRows,
  policyCountLabel,
  filters,
  onFilterChange,
}: {
  greeting: string;
  alerts: PortfolioDashboardAlert[];
  stats: NonNullable<PortfolioDashboardProps["stats"]>;
  policies: NonNullable<PortfolioDashboardProps["policies"]>;
  insights: NonNullable<PortfolioDashboardProps["insights"]>;
  activities: NonNullable<PortfolioDashboardProps["activities"]>;
  renewals: NonNullable<PortfolioDashboardProps["renewals"]>;
  riskRows: NonNullable<PortfolioDashboardProps["riskRows"]>;
  policyCountLabel: string;
  filters: {
    active: boolean;
    pending: boolean;
    highRisk: boolean;
    claims: boolean;
  };
  onFilterChange: (
    key: "active" | "pending" | "highRisk" | "claims",
    value: boolean,
  ) => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-balance text-2xl font-semibold tracking-tight">
            {greeting}
          </h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {alerts.map((alert) => (
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm ring-1",
                  alert.tone === "warning"
                    ? "bg-warning/15 font-medium text-warning ring-warning/20"
                    : "bg-card text-foreground ring-border",
                )}
                key={alert.id}
              >
                {alert.tone === "warning" ? (
                  <TriangleAlert className="size-4" />
                ) : (
                  <AlarmClock className="size-4" />
                )}
                {alert.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton>
            New Policy <Plus className="size-4" />
          </PrimaryButton>
          <SoftButton>
            Export <Download className="size-4" />
          </SoftButton>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-card px-3 text-sm font-medium text-foreground shadow-sm ring-1 ring-border outline-none hover:bg-accent">
              Filter <SlidersHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter Policies</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.active}
                onCheckedChange={(value) =>
                  onFilterChange("active", Boolean(value))
                }
              >
                Active Policies
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.pending}
                onCheckedChange={(value) =>
                  onFilterChange("pending", Boolean(value))
                }
              >
                Pending Renewal
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.highRisk}
                onCheckedChange={(value) =>
                  onFilterChange("highRisk", Boolean(value))
                }
              >
                High Risk
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.claims}
                onCheckedChange={(value) =>
                  onFilterChange("claims", Boolean(value))
                }
              >
                Open Claims
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onFilterChange("active", true);
                  onFilterChange("pending", false);
                  onFilterChange("highRisk", true);
                  onFilterChange("claims", false);
                }}
                variant="destructive"
              >
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Plate className="grid overflow-hidden p-0 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index] ?? ShieldCheck;
          const trend = trendTone[stat.trend];
          return (
            <div
              className={cn(
                "p-4 md:p-5",
                index
                  ? "border-border/50 border-t md:border-t-0 md:border-l"
                  : null,
              )}
              key={stat.id}
            >
              <div className="flex items-center gap-2 text-sm">
                <Icon className="size-4" />
                {stat.label}
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-light tracking-tight tabular-nums">
                    {stat.value}
                  </div>
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-1 text-xs",
                      trend.text,
                    )}
                  >
                    <trend.Icon className="size-4" />
                    <span>{stat.delta}</span>
                    {stat.period ? (
                      <span className="text-muted-foreground">
                        {stat.period}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  {stat.bars.map((height, barIndex) => {
                    const tick = {
                      id: `${stat.id}-bar-${barIndex + 1}`,
                      height,
                    };
                    return (
                      <span
                        className={cn(
                          "w-1.5 rounded-full motion-safe:transition-[height] motion-safe:duration-700",
                          trend.bar,
                        )}
                        key={tick.id}
                        style={{ height: tick.height }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </Plate>

      <section className="mt-8 grid gap-4 xl:grid-cols-[3fr_1fr]">
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Policy Portfolio</h3>
            <SoftButton>
              {policyCountLabel} <ArrowRight className="size-4" />
            </SoftButton>
          </div>
          <div className="grid flex-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">AI Insights</h3>
            <SoftButton aria-label="Open insights" className="size-10 px-0">
              <ArrowRight className="size-4" />
            </SoftButton>
          </div>
          <Plate className="flex flex-1 flex-col gap-3 p-3">
            {insights.map((insight) => (
              <p
                className="rounded-xl bg-muted p-3 text-sm text-muted-foreground"
                key={insight.id}
              >
                {insight.body}
              </p>
            ))}
            <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
              <SoftButton>Dismiss</SoftButton>
              <PrimaryButton className="min-h-8">
                Open report <ArrowRight className="size-4" />
              </PrimaryButton>
            </div>
          </Plate>
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <section className="flex h-full flex-col">
          <h3 className="mb-3 text-lg font-medium">Activity Feed</h3>
          <Plate className="flex-1 p-3">
            {activities.map((item) => (
              <div
                className="grid grid-cols-[5rem_1fr] gap-3 border-b border-border px-1 py-4 last:border-0"
                key={item.id}
              >
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
                <div>
                  <p className="text-sm">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </Plate>
        </section>
        <section className="flex h-full flex-col">
          <h3 className="mb-3 text-lg font-medium">Upcoming Renewals</h3>
          <RenewalsList renewals={renewals} />
        </section>
        <section className="flex h-full flex-col">
          <h3 className="mb-3 text-lg font-medium">Portfolio Risk</h3>
          <Plate className="flex-1 p-4">
            {riskRows.map((row) => (
              <div
                className="flex items-center border-b border-border py-5 last:border-0"
                key={row.id}
              >
                <span className="w-28 text-sm">{row.label}</span>
                <div className="flex flex-1 gap-1">
                  {meterTicks(row.bars, row.id).map((tick) => (
                    <span
                      className={cn("h-4 w-1 rounded-full", toneFill[row.tone])}
                      key={tick.id}
                    />
                  ))}
                </div>
                <span className="tabular-nums">{row.score}</span>
              </div>
            ))}
          </Plate>
        </section>
      </div>
    </>
  );
}

function RenewalsList({
  renewals,
}: {
  renewals: NonNullable<PortfolioDashboardProps["renewals"]>;
}) {
  return (
    <Plate className="flex-1 p-3">
      {renewals.map((item) => (
        <div
          className="flex items-center gap-3 border-b border-border py-4 last:border-0"
          key={item.id}
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-xs text-primary">
            {item.initials}
          </span>
          <div>
            <p className="text-sm">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.type}</p>
          </div>
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-1 text-xs font-medium",
              toneBadge[item.tone],
            )}
          >
            {item.due}
          </span>
        </div>
      ))}
    </Plate>
  );
}

function PolicyCard({
  policy,
}: {
  policy: NonNullable<PortfolioDashboardProps["policies"]>[number];
}) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-card p-3 text-card-foreground shadow-sm ring-1 ring-border outline-none motion-safe:transition-[box-shadow,transform] motion-safe:hover:shadow-md motion-safe:active:scale-[0.96]">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm text-primary">
          {policy.initials}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            toneBadge[policy.tone],
          )}
        >
          {policy.status}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-medium">{policy.name}</h4>
        <p className="text-xs text-muted-foreground">{policy.type}</p>
      </div>
      <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
        <span className="flex items-center gap-1">
          <CircleDollarSign className="size-4" />
          {policy.price}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-border px-2 py-1 shadow-sm">
          {policy.detail.startsWith("Due") ? (
            <CalendarDays className="size-4" />
          ) : null}
          {policy.detail}
        </span>
      </div>
    </article>
  );
}
