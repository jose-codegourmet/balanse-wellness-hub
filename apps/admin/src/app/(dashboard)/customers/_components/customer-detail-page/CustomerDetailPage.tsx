"use client";

import {
  type AdminCustomerDetail,
  type CustomerEntitlement,
  entitlementStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  ONBOARDING_STATUS_LABELS,
  type OnboardingStatus,
  paymentStatusLabel,
  refundStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  StatusBadge,
  UserAvatar,
} from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  EyeOffIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CustomerAboutCard,
  useInterestClassLookup,
} from "@/components/balanse/customer/customer-about-card/CustomerAboutCard";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { adminBundlesQuery, adminCustomerDetailQuery } from "@/lib/query/queries";
import { useCanAdminAction, useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { CustomerReferralCard } from "../customer-referral-card/CustomerReferralCard";
import { GrantPackageForm } from "../grant-package-form/GrantPackageForm";
import type { CustomerDetailPageProps } from "./CustomerDetailPage.meta";

type CustomerBooking = AdminCustomerDetail["upcoming"][number];

type ActivityTabId = "upcoming" | "pending" | "history" | "requests" | "attendance" | "payments";

const ACTIVITY_TABS: readonly { id: ActivityTabId; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "history", label: "History" },
  { id: "requests", label: "Requests" },
  { id: "attendance", label: "Attendance" },
  { id: "payments", label: "Payments" },
];

const ACTIVITY_TITLES: Record<ActivityTabId, string> = {
  upcoming: "Upcoming bookings",
  pending: "Pending bookings",
  history: "Booking history",
  requests: "Cancellation & reschedule history",
  attendance: "Attendance & no-show history",
  payments: "Payment & refund history",
};

const ACTIVITY_EMPTY: Record<ActivityTabId, string> = {
  upcoming: "No upcoming bookings.",
  pending: "No pending bookings.",
  history: "No booking history.",
  requests: "No cancellation or reschedule history.",
  attendance: "No attendance history.",
  payments: "No payment or refund history.",
};

function activityRows(detail: AdminCustomerDetail, tab: ActivityTabId): CustomerBooking[] {
  switch (tab) {
    case "upcoming":
      return detail.upcoming;
    case "pending":
      return detail.pending;
    case "history":
      return detail.history;
    case "requests":
      return detail.requestHistory;
    case "attendance":
      return detail.attendanceHistory;
    case "payments":
      return detail.paymentHistory;
  }
}

const ONBOARDING_BADGE_VARIANT: Record<OnboardingStatus, "success" | "warning" | "neutral"> = {
  completed: "success",
  in_progress: "neutral",
  skipped: "warning",
  not_started: "neutral",
};

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <h2 className="font-display text-xl leading-tight">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

function BookingTitle({ booking, canOpen }: { booking: CustomerBooking; canOpen: boolean }) {
  const name = sessionDisplayName(booking.session);
  return canOpen ? (
    <Link
      className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
      href={`/bookings/${booking.id}`}
    >
      {name}
    </Link>
  ) : (
    <span className="font-medium text-foreground">{name}</span>
  );
}

function BookingMeta({ booking }: { booking: CustomerBooking }) {
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      {formatSessionDate(booking.session.startsAt)} ·{" "}
      {formatSessionTimeRange(booking.session.startsAt, booking.session.endsAt)}
      {booking.session.coachName ? ` · ${booking.session.coachName}` : null}
    </p>
  );
}

function BookingList({
  rows,
  empty,
  canOpenBooking,
}: {
  rows: CustomerBooking[];
  empty: string;
  canOpenBooking: boolean;
}) {
  if (rows.length === 0) return <EmptyNote>{empty}</EmptyNote>;
  return (
    <ul className="divide-y divide-border/60">
      {rows.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-muted/40"
        >
          <div className="min-w-0">
            <BookingTitle booking={booking} canOpen={canOpenBooking} />
            <BookingMeta booking={booking} />
          </div>
          <StatusBadge status={booking.status} surface="admin" />
        </li>
      ))}
    </ul>
  );
}

function PaymentList({
  rows,
  canOpenBooking,
  canReadRefunds,
}: {
  rows: CustomerBooking[];
  canOpenBooking: boolean;
  canReadRefunds: boolean;
}) {
  if (rows.length === 0) return <EmptyNote>{ACTIVITY_EMPTY.payments}</EmptyNote>;
  return (
    <ul className="divide-y divide-border/60">
      {rows.map((booking) => (
        <li key={booking.id} className="px-5 py-4 transition-colors hover:bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <BookingTitle booking={booking} canOpen={canOpenBooking} />
              <BookingMeta booking={booking} />
            </div>
            <StatusBadge status={booking.status} surface="admin" />
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>
                <Badge appearance="soft" size="sm">
                  {paymentStatusLabel(booking.paymentStatus)}
                </Badge>
              </dd>
            </div>
            {canReadRefunds ? (
              <div className="flex items-center gap-2">
                <dt className="text-muted-foreground">Refund</dt>
                <dd>
                  <Badge appearance="soft" size="sm">
                    {booking.refundStatus === "NOT_APPLICABLE"
                      ? "Not applicable"
                      : refundStatusLabel(booking.refundStatus)}
                  </Badge>
                </dd>
              </div>
            ) : null}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function ContactRow({
  icon,
  label,
  href,
  value,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">
          {href ? (
            <a className="hover:underline hover:underline-offset-4" href={href}>
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}

function PackageItem({ entitlement }: { entitlement: CustomerEntitlement }) {
  const granted = Math.max(entitlement.grantedCredits, 0);
  const remaining = Math.max(entitlement.remainingCredits, 0);
  const percent = granted > 0 ? Math.min(100, Math.round((remaining / granted) * 100)) : 0;

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{entitlement.snapshot.name}</p>
        <Badge appearance="soft" size="sm">
          {entitlementStatusLabel(entitlement.status)}
        </Badge>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`${entitlement.snapshot.name} sessions remaining`}
        aria-valuemin={0}
        aria-valuemax={granted}
        aria-valuenow={remaining}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground tabular-nums">{remaining}</span> of{" "}
          <span className="tabular-nums">{granted}</span> sessions remaining
        </span>
        <span className="tabular-nums">{formatPeso(entitlement.snapshot.pricePhp)}</span>
      </p>
      {entitlement.expiresAt ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Expires {formatSessionDate(entitlement.expiresAt)}
        </p>
      ) : null}
    </li>
  );
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const { principal } = useMockPrincipal();
  const canReadBundles = useCanAdminRoute("/bundles");
  const canManageBundles = useCanAdminAction("bundles-manage");
  const canReadRefunds = useCanAdminAction("refunds-read");
  const canOpenBooking = useCanAdminRoute("/bookings");
  const [tab, setTab] = useTabParam<ActivityTabId>("tab", ACTIVITY_TABS, "upcoming");
  const interestClasses = useInterestClassLookup();
  const query = useSuspenseQuery(adminCustomerDetailQuery(principal, customerId));
  const bundlesQuery = useQuery({
    ...adminBundlesQuery(principal),
    enabled: canReadBundles,
  });
  const detail = query.data;
  if (!detail) return null;

  const entitlements = detail.entitlements ?? [];
  const rows = activityRows(detail, tab);
  const lastVisit = detail.lastVisitAt ? formatSessionDate(detail.lastVisitAt) : "Never";
  const personName = { firstName: detail.firstName, lastName: detail.lastName };
  const nickname = detail.nickname?.trim();

  return (
    <AdminPageShell
      eyebrow="Customer"
      title={detail.fullName}
      leading={
        <span aria-hidden>
          <UserAvatar
            name={personName}
            avatarUrl={detail.avatarUrl}
            seed={detail.id}
            size="xl"
            className="shadow-sm ring-2 ring-background"
          />
        </span>
      }
      subtitle={
        <>
          {nickname ? (
            <span className="text-sm text-muted-foreground">
              Goes by <span className="font-medium text-foreground italic">{nickname}</span>
            </span>
          ) : null}
          <Badge
            appearance="soft"
            size="sm"
            variant={ONBOARDING_BADGE_VARIANT[detail.onboardingStatus]}
          >
            Onboarding: {ONBOARDING_STATUS_LABELS[detail.onboardingStatus]}
          </Badge>
          {detail.showOnPublicRoster ? null : (
            <Badge appearance="soft" size="sm" variant="neutral">
              <EyeOffIcon aria-hidden className="size-3" />
              Hidden on public roster
            </Badge>
          )}
        </>
      }
      description={`Signed in with ${detail.authMethod === "google" ? "Google" : "email"}.`}
      breadcrumb={[{ label: "Customers", href: "/customers" }, { label: detail.fullName }]}
      actions={
        <Button nativeButton={false} variant="outline" render={<Link href="/customers" />}>
          <ArrowLeftIcon aria-hidden />
          Back to customers
        </Button>
      }
      stats={
        <dl className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          {[
            { label: "Upcoming", value: String(detail.upcoming.length) },
            { label: "Pending", value: String(detail.pending.length) },
            { label: "Total bookings", value: String(detail.bookingCount) },
            { label: "Last visit", value: lastVisit, text: true },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "min-w-0 pr-3 sm:pr-5",
                index % 2 === 1 && "border-l border-border pl-4",
                index === 2 && "sm:border-l sm:border-border sm:pl-5",
                index > 0 && "sm:pl-5",
              )}
            >
              <dt className="text-xs font-medium text-muted-foreground">{stat.label}</dt>
              <dd
                className={cn(
                  "mt-1 font-semibold tabular-nums",
                  stat.text ? "text-lg leading-tight sm:text-2xl" : "text-2xl",
                )}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <AdminPageTabs
            tabs={ACTIVITY_TABS}
            value={tab}
            onValueChange={(id) => setTab(id as ActivityTabId)}
            label="Customer activity"
          >
            <Panel
              title={ACTIVITY_TITLES[tab]}
              action={
                <Badge appearance="soft" size="sm" className="tabular-nums">
                  {rows.length}
                </Badge>
              }
            >
              {tab === "payments" ? (
                <PaymentList
                  rows={detail.paymentHistory}
                  canOpenBooking={canOpenBooking}
                  canReadRefunds={canReadRefunds}
                />
              ) : (
                <BookingList
                  rows={rows}
                  empty={ACTIVITY_EMPTY[tab]}
                  canOpenBooking={canOpenBooking}
                />
              )}
            </Panel>
          </AdminPageTabs>
        </div>

        <aside className="grid gap-6">
          <Panel title="Profile">
            <div className="flex items-center gap-3 px-5 pt-5">
              <span aria-hidden className="shrink-0">
                <UserAvatar
                  name={personName}
                  avatarUrl={detail.avatarUrl}
                  seed={detail.id}
                  size="lg"
                  className="size-12"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{detail.fullName}</p>
                {nickname ? (
                  <p className="truncate text-xs text-muted-foreground italic">{nickname}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {detail.lastVisitAt ? `Last visit ${lastVisit}` : "No visits yet"}
                </p>
              </div>
            </div>
            <dl className="grid gap-4 p-5">
              <ContactRow
                icon={<MailIcon aria-hidden />}
                label="Email"
                href={`mailto:${detail.email}`}
                value={detail.email}
              />
              <ContactRow
                icon={<PhoneIcon aria-hidden />}
                label="Contact"
                href={`tel:${detail.contactNumber.replace(/\s+/g, "")}`}
                value={detail.contactNumber}
              />
            </dl>
          </Panel>

          <CustomerAboutCard
            onboarding={detail.onboarding}
            onboardingStatus={detail.onboardingStatus}
            classes={interestClasses.classes}
            classHref={interestClasses.classHref}
          />

          {detail.referral ? <CustomerReferralCard referral={detail.referral} /> : null}

          {canReadBundles ? (
            <Panel title="Packages">
              {entitlements.length === 0 ? (
                <EmptyNote>No packages on this customer.</EmptyNote>
              ) : (
                <ul className="divide-y divide-border/60">
                  {entitlements.map((entitlement) => (
                    <PackageItem key={entitlement.id} entitlement={entitlement} />
                  ))}
                </ul>
              )}
              {canManageBundles && bundlesQuery.data ? (
                <Collapsible className="border-t border-border/70 bg-muted/20 px-5 py-4">
                  <CollapsibleTrigger
                    render={<Button type="button" variant="outline" size="sm" className="w-full" />}
                  >
                    <PlusIcon aria-hidden />
                    Grant a package
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <GrantPackageForm customerId={customerId} bundles={bundlesQuery.data} />
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </Panel>
          ) : null}

          <Panel title="Accepted policies">
            {detail.policyAcceptances.length === 0 ? (
              <EmptyNote>No accepted policy versions.</EmptyNote>
            ) : (
              <ul className="divide-y divide-border/60">
                {detail.policyAcceptances.map((row) => (
                  <li
                    key={`${row.documentName}-${row.version}`}
                    className="flex items-start gap-3 px-5 py-4"
                  >
                    <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{row.documentName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Version {row.version} · Accepted {formatSessionDate(row.acceptedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </AdminPageShell>
  );
}
