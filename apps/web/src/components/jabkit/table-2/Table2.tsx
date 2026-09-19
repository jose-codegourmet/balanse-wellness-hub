"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  EllipsisIcon,
  EyeIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";
import { Badge } from "@/components/jabkit/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  Table2Invoice,
  Table2InvoiceStatus,
  Table2Props,
  Table2Sort,
  Table2SortDirection,
  Table2SortKey,
} from "./Table2.types";

const DEFAULT_INVOICES: Table2Invoice[] = [
  {
    id: "INV-0041",
    client: "Miriam Okafor",
    initials: "MO",
    project: "Brand Refresh",
    amount: 4200,
    method: "Wire Transfer",
    due: "2026-06-30",
    status: "pending",
  },
  {
    id: "INV-0040",
    client: "Theo Hartmann",
    initials: "TH",
    project: "API Integration",
    amount: 1850,
    method: "Credit Card",
    due: "2026-06-15",
    status: "paid",
  },
  {
    id: "INV-0039",
    client: "Suki Nakamura",
    initials: "SN",
    project: "Dashboard UI",
    amount: 6500,
    method: "ACH",
    due: "2026-06-01",
    status: "overdue",
  },
  {
    id: "INV-0038",
    client: "Elias Ferreira",
    initials: "EF",
    project: "Mobile App MVP",
    amount: 9000,
    method: "Wire Transfer",
    due: "2026-05-28",
    status: "paid",
  },
  {
    id: "INV-0037",
    client: "Priya Menon",
    initials: "PM",
    project: "SEO Audit",
    amount: 780,
    method: "Credit Card",
    due: "2026-05-10",
    status: "refunded",
  },
  {
    id: "INV-0036",
    client: "Dmitri Volkov",
    initials: "DV",
    project: "Data Pipeline",
    amount: 3350,
    method: "ACH",
    due: "2026-04-25",
    status: "paid",
  },
  {
    id: "INV-0035",
    client: "Amara Diallo",
    initials: "AD",
    project: "Design System",
    amount: 5400,
    method: "Wire Transfer",
    due: "2026-06-22",
    status: "pending",
  },
  {
    id: "INV-0034",
    client: "Noah Bergstrom",
    initials: "NB",
    project: "Marketing Site",
    amount: 2100,
    method: "Credit Card",
    due: "2026-04-18",
    status: "paid",
  },
  {
    id: "INV-0033",
    client: "Lucia Romano",
    initials: "LR",
    project: "Onboarding Flow",
    amount: 3950,
    method: "ACH",
    due: "2026-05-31",
    status: "overdue",
  },
  {
    id: "INV-0032",
    client: "Kwame Mensah",
    initials: "KM",
    project: "Analytics Setup",
    amount: 1280,
    method: "Credit Card",
    due: "2026-04-09",
    status: "paid",
  },
  {
    id: "INV-0031",
    client: "Ingrid Larsen",
    initials: "IL",
    project: "Accessibility Pass",
    amount: 2650,
    method: "Wire Transfer",
    due: "2026-06-12",
    status: "pending",
  },
  {
    id: "INV-0030",
    client: "Mateo Castillo",
    initials: "MC",
    project: "Checkout Rebuild",
    amount: 7300,
    method: "ACH",
    due: "2026-03-30",
    status: "refunded",
  },
  {
    id: "INV-0029",
    client: "Yuki Tanaka",
    initials: "YT",
    project: "Email Templates",
    amount: 940,
    method: "Credit Card",
    due: "2026-03-22",
    status: "paid",
  },
  {
    id: "INV-0028",
    client: "Fatima Zahra",
    initials: "FZ",
    project: "Localization",
    amount: 4880,
    method: "Wire Transfer",
    due: "2026-05-19",
    status: "overdue",
  },
  {
    id: "INV-0027",
    client: "Oscar Lindqvist",
    initials: "OL",
    project: "CMS Migration",
    amount: 6150,
    method: "ACH",
    due: "2026-06-05",
    status: "pending",
  },
  {
    id: "INV-0026",
    client: "Hana Novak",
    initials: "HN",
    project: "Component Audit",
    amount: 1720,
    method: "Credit Card",
    due: "2026-03-14",
    status: "paid",
  },
  {
    id: "INV-0025",
    client: "Bilal Haddad",
    initials: "BH",
    project: "Search Revamp",
    amount: 5230,
    method: "Wire Transfer",
    due: "2026-05-02",
    status: "overdue",
  },
  {
    id: "INV-0024",
    client: "Sienna Walsh",
    initials: "SW",
    project: "Pricing Page",
    amount: 1360,
    method: "Credit Card",
    due: "2026-02-26",
    status: "paid",
  },
];

const STATUS_LABEL: Record<Table2InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  refunded: "Refunded",
};

const STATUS_BADGE: Record<
  Table2InvoiceStatus,
  { variant: "primary" | "secondary" | "destructive" | "outline"; dot: string }
> = {
  paid: { variant: "primary", dot: "bg-primary-foreground" },
  pending: { variant: "secondary", dot: "bg-muted-foreground" },
  overdue: { variant: "destructive", dot: "bg-destructive" },
  refunded: { variant: "outline", dot: "bg-muted-foreground" },
};

const defaults = {
  eyebrow: "Acme Inc.",
  title: "Invoices",
  description: "Recent billing activity across all client projects.",
  outstandingLabel: "Outstanding",
  searchPlaceholder: "Filter by client...",
  emptyLabel: "No invoices match your filter.",
  resultLabel: "Result",
  resultsLabel: "Results",
  selectedLabel: "Selected",
  clearLabel: "Clear",
  markPaidLabel: "Mark as paid",
  remindLabel: "Send reminder",
  downloadLabel: "Download",
  viewLabel: "View",
  invoicesLabel: "invoices",
  pageLabel: "Page",
  previousLabel: "Previous page",
  nextLabel: "Next page",
  footnote: "Figures shown in USD. Last updated Jun 17, 2026.",
} as const;

const DEFAULT_SORT: Table2Sort = { key: "due", direction: "desc" };

const headLabel =
  "text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const sortButtonClass =
  "-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none";
const outlineButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";
const iconButtonClass =
  "inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";
const ghostIconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

function formatAmount(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDueDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function compareInvoices(
  a: Table2Invoice,
  b: Table2Invoice,
  sort: Table2Sort,
) {
  const direction = sort.direction === "asc" ? 1 : -1;
  if (sort.key === "client") {
    return a.client.localeCompare(b.client) * direction;
  }
  if (sort.key === "amount") {
    return (a.amount - b.amount) * direction;
  }
  return a.due.localeCompare(b.due) * direction;
}

function nextDirection(
  current: Table2Sort,
  key: Table2SortKey,
): Table2SortDirection {
  if (current.key !== key) return "asc";
  return current.direction === "asc" ? "desc" : "asc";
}

function downloadCsv(invoices: Table2Invoice[]) {
  const header = [
    "Invoice",
    "Client",
    "Project",
    "Method",
    "Due",
    "Status",
    "Amount",
    "Currency",
  ];
  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.client,
    invoice.project,
    invoice.method,
    invoice.due,
    invoice.status,
    String(invoice.amount),
    invoice.currency ?? "USD",
  ]);
  const csv = [header, ...rows]
    .map((cells) =>
      cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "invoices.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function SortIcon({ sorted }: { sorted: false | Table2SortDirection }) {
  if (sorted === "asc") {
    return <ArrowUpIcon className="size-3.5" aria-hidden="true" />;
  }
  if (sorted === "desc") {
    return <ArrowDownIcon className="size-3.5" aria-hidden="true" />;
  }
  return (
    <ChevronsUpDownIcon
      className="size-3.5 text-muted-foreground/60"
      aria-hidden="true"
    />
  );
}

function SelectBox({
  checked,
  indeterminate,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useLayoutEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate) && !checked;
    }
  }, [checked, indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      aria-label={label}
      className="size-4 rounded-[4px] border border-input bg-background text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    />
  );
}

export function Table2({
  className,
  eyebrow = defaults.eyebrow,
  title = defaults.title,
  description = defaults.description,
  outstandingLabel = defaults.outstandingLabel,
  searchPlaceholder = defaults.searchPlaceholder,
  emptyLabel = defaults.emptyLabel,
  resultLabel = defaults.resultLabel,
  resultsLabel = defaults.resultsLabel,
  selectedLabel = defaults.selectedLabel,
  clearLabel = defaults.clearLabel,
  markPaidLabel = defaults.markPaidLabel,
  remindLabel = defaults.remindLabel,
  downloadLabel = defaults.downloadLabel,
  viewLabel = defaults.viewLabel,
  invoicesLabel = defaults.invoicesLabel,
  pageLabel = defaults.pageLabel,
  previousLabel = defaults.previousLabel,
  nextLabel = defaults.nextLabel,
  footnote = defaults.footnote,
  invoices: invoicesProp,
  defaultInvoices = DEFAULT_INVOICES,
  defaultSearch = "",
  pageSize = 7,
  defaultPage = 1,
  defaultSort = DEFAULT_SORT,
  onInvoicesChange,
  onMarkPaid,
  onSendReminder,
  onDownload,
  onView,
  ...props
}: Table2Props) {
  const headingId = React.useId();
  const searchId = React.useId();
  const isControlled = invoicesProp !== undefined;
  const [uncontrolled, setUncontrolled] =
    React.useState<Table2Invoice[]>(defaultInvoices);
  const invoices = isControlled ? invoicesProp : uncontrolled;
  const [query, setQuery] = React.useState(defaultSearch);
  const [sort, setSort] = React.useState<Table2Sort>(defaultSort);
  const [page, setPage] = React.useState(Math.max(1, defaultPage));
  const [selected, setSelected] = React.useState<string[]>([]);
  const [notice, setNotice] = React.useState("");

  const commit = React.useCallback(
    (next: Table2Invoice[]) => {
      if (!isControlled) setUncontrolled(next);
      onInvoicesChange?.(next);
    },
    [isControlled, onInvoicesChange],
  );

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = invoices.filter((invoice) =>
      needle ? invoice.client.toLowerCase().includes(needle) : true,
    );
    return [...rows].sort((a, b) => compareInvoices(a, b, sort));
  }, [invoices, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageIds = pageRows.map((invoice) => invoice.id);
  const selectedOnPage = pageIds.filter((id) => selected.includes(id));
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const somePageSelected = selectedOnPage.length > 0 && !allPageSelected;

  const outstanding = invoices
    .filter(
      (invoice) =>
        invoice.status === "pending" || invoice.status === "overdue",
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  React.useEffect(() => {
    const ids = new Set(invoices.map((invoice) => invoice.id));
    setSelected((current) => current.filter((id) => ids.has(id)));
  }, [invoices]);

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    );
  };

  const togglePage = (checked: boolean) => {
    setSelected((current) => {
      if (checked) return [...new Set([...current, ...pageIds])];
      return current.filter((id) => !pageIds.includes(id));
    });
  };

  const markPaid = (ids: string[]) => {
    if (ids.length === 0) return;
    commit(
      invoices.map((invoice) =>
        ids.includes(invoice.id) ? { ...invoice, status: "paid" } : invoice,
      ),
    );
    onMarkPaid?.(ids);
    setNotice(
      ids.length === 1
        ? "1 invoice marked as paid."
        : `${ids.length} invoices marked as paid.`,
    );
    setSelected([]);
  };

  const sendReminder = (ids: string[]) => {
    if (ids.length === 0) return;
    onSendReminder?.(ids);
    setNotice(
      ids.length === 1
        ? "Payment reminder sent for 1 invoice."
        : `Payment reminders sent for ${ids.length} invoices.`,
    );
  };

  const download = (ids: string[]) => {
    const rows = invoices.filter((invoice) => ids.includes(invoice.id));
    if (rows.length === 0) return;
    onDownload?.(ids);
    downloadCsv(rows);
    setNotice(
      rows.length === 1
        ? "Preparing 1 invoice as PDF."
        : `Preparing ${rows.length} invoices as PDF.`,
    );
  };

  const viewInvoice = (id: string) => {
    onView?.(id);
    setNotice(`Opened ${id}.`);
  };

  const toggleSort = (key: Table2SortKey) => {
    setSort((current) => ({
      key,
      direction: nextDirection(current, key),
    }));
    setPage(1);
  };

  const sortedFor = (key: Table2SortKey): false | Table2SortDirection =>
    sort.key === key ? sort.direction : false;

  return (
    <section
      data-slot="table-2"
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-svh w-full items-start justify-center bg-background px-6 py-12 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {eyebrow}
            </p>
            <h1
              id={headingId}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              {outstandingLabel}
            </span>
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {formatAmount(outstanding)}
            </span>
          </div>
        </div>

        <hr className="my-5 h-px border-0 bg-border" />

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label="Filter invoices by client"
              className="h-8 w-52 rounded-md border border-input bg-background pr-2.5 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? resultLabel : resultsLabel}
          </p>
        </div>

        {selected.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {selected.length} {selectedLabel}
              </span>
              <button
                type="button"
                className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none"
                onClick={() => setSelected([])}
              >
                {clearLabel}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => download(selected)}
              >
                <DownloadIcon className="size-3.5" aria-hidden="true" />
                {downloadLabel}
              </button>
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => sendReminder(selected)}
              >
                <MailIcon className="size-3.5" aria-hidden="true" />
                {remindLabel}
              </button>
              <button
                type="button"
                className={outlineButtonClass}
                onClick={() => markPaid(selected)}
              >
                <CheckIcon className="size-3.5" aria-hidden="true" />
                {markPaidLabel}
              </button>
            </div>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {notice}
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="bg-muted/40">
                  <th scope="col" className="h-9 w-10 pl-4">
                    <SelectBox
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      label="Select all invoices on this page"
                      onCheckedChange={togglePage}
                    />
                  </th>
                  <th scope="col" className="h-9 px-2">
                    <span className={headLabel}>Invoice</span>
                  </th>
                  <th scope="col" className="h-9 px-2">
                    <button
                      type="button"
                      onClick={() => toggleSort("client")}
                      className={sortButtonClass}
                    >
                      Client
                      <SortIcon sorted={sortedFor("client")} />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="hidden h-9 px-2 sm:table-cell"
                  >
                    <span className={headLabel}>Project</span>
                  </th>
                  <th
                    scope="col"
                    className="hidden h-9 px-2 md:table-cell"
                  >
                    <span className={headLabel}>Method</span>
                  </th>
                  <th
                    scope="col"
                    className="hidden h-9 px-2 md:table-cell"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("due")}
                      className={sortButtonClass}
                    >
                      Due
                      <SortIcon sorted={sortedFor("due")} />
                    </button>
                  </th>
                  <th scope="col" className="h-9 px-2">
                    <span className={headLabel}>Status</span>
                  </th>
                  <th scope="col" className="h-9 px-2 text-right">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleSort("amount")}
                        className={sortButtonClass}
                      >
                        Amount
                        <SortIcon sorted={sortedFor("amount")} />
                      </button>
                    </div>
                  </th>
                  <th scope="col" className="h-9 w-10 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="h-24 px-4 text-center text-sm text-muted-foreground"
                    >
                      {emptyLabel}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((invoice) => {
                    const isSelected = selected.includes(invoice.id);
                    const badge = STATUS_BADGE[invoice.status];
                    return (
                      <tr
                        key={invoice.id}
                        data-state={isSelected ? "selected" : undefined}
                        className={cn(
                          "border-b border-border/60 transition-colors duration-200 ease-out last:border-b-0 hover:bg-muted/30 motion-reduce:transition-none data-[state=selected]:bg-muted",
                        )}
                      >
                        <td className="px-2 py-2 pl-4 align-middle">
                          <SelectBox
                            checked={isSelected}
                            label={`Select ${invoice.id}`}
                            onCheckedChange={(checked) =>
                              toggleRow(invoice.id, checked)
                            }
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <span className="font-mono text-xs text-muted-foreground">
                            {invoice.id}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar
                              size="sm"
                              className="shrink-0 border border-border"
                            >
                              {invoice.avatar ? (
                                <AvatarImage
                                  src={invoice.avatar}
                                  alt={invoice.client}
                                  className="grayscale"
                                />
                              ) : null}
                              <AvatarFallback className="text-[10px]">
                                {invoice.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium text-foreground">
                              {invoice.client}
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-2 py-2 align-middle sm:table-cell">
                          <span className="block max-w-[140px] truncate text-sm text-muted-foreground">
                            {invoice.project}
                          </span>
                        </td>
                        <td className="hidden px-2 py-2 align-middle md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {invoice.method}
                          </span>
                        </td>
                        <td className="hidden px-2 py-2 align-middle md:table-cell">
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {formatDueDate(invoice.due)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <Badge
                            variant={badge.variant}
                            className="gap-1.5 rounded-full text-[11px] font-medium"
                          >
                            <span
                              className={cn(
                                "inline-block size-1.5 shrink-0 rounded-full",
                                badge.dot,
                              )}
                              aria-hidden="true"
                            />
                            {STATUS_LABEL[invoice.status]}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <span className="block text-right text-sm font-semibold text-foreground tabular-nums">
                            {formatAmount(invoice.amount, invoice.currency)}
                          </span>
                        </td>
                        <td className="px-2 py-2 pr-4 align-middle">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label={`Actions for ${invoice.id}`}
                                className={ghostIconButtonClass}
                              >
                                <EllipsisIcon
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  onClick={() => viewInvoice(invoice.id)}
                                >
                                  <EyeIcon aria-hidden="true" />
                                  {viewLabel}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => download([invoice.id])}
                                >
                                  <DownloadIcon aria-hidden="true" />
                                  {downloadLabel}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {filtered.length} {invoicesLabel}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={iconButtonClass}
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label={previousLabel}
              >
                <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
              </button>
              <span className="px-1 text-xs text-muted-foreground tabular-nums">
                {pageLabel} {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                className={iconButtonClass}
                disabled={currentPage >= pageCount}
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                aria-label={nextLabel}
              >
                <ChevronRightIcon className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{footnote}</p>
      </div>
    </section>
  );
}
