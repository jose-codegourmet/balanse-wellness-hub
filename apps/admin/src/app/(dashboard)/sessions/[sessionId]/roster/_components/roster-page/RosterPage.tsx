"use client";

import {
  type AdminRosterPerson,
  type BookingStatus,
  type CustomerBooking,
  formatSessionDate,
  formatSessionTimeRange,
  NO_REFUND_ON_NOSHOW_NOTE,
  paymentStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { isMockAuthorizationError } from "@balanse/mock";
import {
  Badge,
  Button,
  Chip,
  CoachPhoto,
  cn,
  DetailPageSkeleton,
  FeedbackState,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  StatusBadge,
  UserAvatar,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { Check, EyeOff, Hourglass, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import {
  CustomerAboutCard,
  type InterestClass,
  useInterestClassLookup,
} from "@/components/balanse/customer/customer-about-card/CustomerAboutCard";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  PublicShareAction,
  sessionShareTarget,
} from "@/components/balanse/public-share-action/PublicShareAction";
import { useCheckIn, useMarkNoShow } from "@/lib/query/mutations";
import { adminPublicClassesQuery, adminSessionRosterQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { RosterGroup, RosterPageProps } from "./RosterPage.meta";

export type { RosterGroup, RosterPageProps } from "./RosterPage.meta";

const BREADCRUMB = [{ label: "Schedule", href: "/schedule" }, { label: "Roster" }];

type GroupFilter = "all" | RosterGroup;

/** Display order inside the grid: who the door needs first, no-shows last. */
const GROUP_ORDER: RosterGroup[] = ["to_check_in", "checked_in", "held", "waitlist", "no_show"];

const GROUP_LABEL: Record<RosterGroup, string> = {
  to_check_in: "To check in",
  checked_in: "Checked in",
  held: "Held",
  waitlist: "Waitlist",
  no_show: "No-show",
};

const FILTERS: { id: GroupFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...GROUP_ORDER.map((id) => ({ id, label: GROUP_LABEL[id] })),
];

type Guest = {
  row: CustomerBooking;
  /** #353 identity (avatar, names, opt-out, onboarding when the viewer may see it). */
  person: AdminRosterPerson | null;
  group: RosterGroup;
  /** 1-based FIFO position, waitlist only. */
  position?: number;
};

function groupForStatus(status: BookingStatus): RosterGroup {
  if (status === "CONFIRMED") return "to_check_in";
  if (status === "CHECKED_IN" || status === "COMPLETED") return "checked_in";
  if (status === "NO_SHOW") return "no_show";
  if (status === "WAITLISTED") return "waitlist";
  // HELD_AWAITING_PAYMENT, PAYMENT_SUBMITTED, CANCELLATION_REQUESTED, RESCHEDULE_REQUESTED
  return "held";
}

function guestName(guest: Guest): string {
  if (guest.person) {
    const full = `${guest.person.firstName} ${guest.person.lastName}`.trim();
    if (full) return full;
  }
  return guest.row.customerName ?? "Guest";
}

function guestNickname(guest: Guest): string | null {
  return guest.person?.nickname?.trim() || null;
}

function isHiddenOnPublicRoster(guest: Guest): boolean {
  return guest.person?.showOnPublicRoster === false;
}

type InterestLookup = {
  classes: Readonly<Record<string, InterestClass>>;
  classHref: ((classId: string) => string | null) | null;
};

function guestCaption(guest: Guest): string {
  return guest.group === "waitlist" && guest.position
    ? `Waitlist #${guest.position}`
    : GROUP_LABEL[guest.group];
}

export function RosterPage({ sessionId, initialGuestId = null }: RosterPageProps) {
  const { principal } = useMockPrincipal();
  const canReadPayments = useCanAdminRoute("/payments");
  const canOpenCoach = useCanAdminRoute("/coaches");
  const rosterQuery = useQuery(adminSessionRosterQuery(principal, sessionId));
  const publicClassesQuery = useQuery(adminPublicClassesQuery(principal));
  const checkIn = useCheckIn();
  const markNoShow = useMarkNoShow();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GroupFilter>("all");
  const [openId, setOpenId] = useState<string | null>(initialGuestId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const interestClasses = useInterestClassLookup();

  if (rosterQuery.isPending && !rosterQuery.data) {
    return (
      <AdminPageShell title="Roster" breadcrumb={BREADCRUMB}>
        <DetailPageSkeleton label="Loading roster" />
      </AdminPageShell>
    );
  }

  if (rosterQuery.isError || !rosterQuery.data) {
    const error = rosterQuery.error;
    if (
      isMockAuthorizationError(error) &&
      (error.code === "ownership" || error.code === "forbidden")
    ) {
      return <AccessDenied kind="ownership" homeHref="/schedule" />;
    }
    return (
      <AdminPageShell title="Roster" breadcrumb={BREADCRUMB}>
        <FeedbackState
          id="calendar.load-failed"
          title="Roster could not load"
          description="This session roster did not load. Retry the request or return to the schedule."
          actionLabel="Retry"
          onAction={() => {
            void rosterQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const roster = rosterQuery.data;
  const personFor = (row: CustomerBooking) => roster.people?.[row.customerId] ?? null;
  const guests: Guest[] = [
    ...roster.confirmed.map<Guest>((row) => ({
      row,
      person: personFor(row),
      group: groupForStatus(row.status),
    })),
    ...roster.held.map<Guest>((row) => ({ row, person: personFor(row), group: "held" })),
    ...roster.waitlisted.map<Guest>((row, index) => ({
      row,
      person: personFor(row),
      group: "waitlist",
      position: index + 1,
    })),
  ].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
      (a.position ?? 0) - (b.position ?? 0) ||
      guestName(a).localeCompare(guestName(b)),
  );
  const counts = Object.fromEntries(
    FILTERS.map(({ id }) => [
      id,
      id === "all" ? guests.length : guests.filter((guest) => guest.group === id).length,
    ]),
  ) as Record<GroupFilter, number>;
  const query = search.trim().toLowerCase();
  const visible = guests.filter(
    (guest) =>
      (filter === "all" || guest.group === filter) &&
      (!query || `${guestName(guest)} ${guestNickname(guest) ?? ""}`.toLowerCase().includes(query)),
  );
  const openGuest = openId ? (guests.find((guest) => guest.row.id === openId) ?? null) : null;

  async function runAttendance(
    bookingId: string,
    action: (id: string) => Promise<unknown>,
    onDone: () => void,
  ) {
    setBusyId(bookingId);
    try {
      await action(bookingId);
      onDone();
      setOpenId(null);
    } catch {
      notify.admin("booking.check-in-failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPageShell
      className="max-w-6xl overflow-x-hidden"
      eyebrow="Live session roster"
      title={sessionDisplayName(roster.session)}
      description={`${formatSessionDate(roster.session.startsAt)} · ${formatSessionTimeRange(roster.session.startsAt, roster.session.endsAt)}`}
      breadcrumb={BREADCRUMB}
      actions={
        <PublicShareAction
          target={sessionShareTarget(
            roster.session,
            publicClassesQuery.data?.find((row) => row.id === roster.session.classId)?.slug,
          )}
          size="default"
          className="flex flex-wrap items-center gap-2"
        />
      }
      stats={<RosterStats roster={roster} />}
    >
      <div className="grid gap-8">
        <section aria-labelledby="roster-coaches">
          <h2
            id="roster-coaches"
            className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase"
          >
            Coaches
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-5">
            {roster.session.coaches.map((coach) => {
              const face = (
                <span className="relative block">
                  <CoachPhoto
                    photoKey={coach.photoKey}
                    name={coach.name}
                    className="size-16 rounded-full shadow-sm ring-2 ring-background"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
                  >
                    <ShieldCheck className="size-3.5" />
                  </span>
                </span>
              );
              return (
                <li key={coach.id} className="flex w-24 flex-col items-center gap-2 text-center">
                  {canOpenCoach ? (
                    <Link
                      href={`/coaches/${coach.id}`}
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`${coach.name}, coach`}
                    >
                      {face}
                    </Link>
                  ) : (
                    face
                  )}
                  <span className="line-clamp-2 text-xs leading-snug font-medium">
                    {coach.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="roster-participants" className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="roster-participants"
              className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase"
            >
              Participants
            </h2>
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search guests"
                aria-label="Search guests by name or nickname"
                className="pl-9"
              />
            </div>
          </div>

          <fieldset className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <legend className="sr-only">Filter guests</legend>
            {FILTERS.map(({ id, label }) => (
              <Chip
                key={id}
                size="sm"
                selected={filter === id}
                onClick={() => setFilter(id)}
                className="snap-start"
              >
                {label}
                <span className={cn("tabular-nums", filter === id ? "opacity-80" : "opacity-60")}>
                  · {counts[id]}
                </span>
              </Chip>
            ))}
          </fieldset>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {guests.length === 0
                ? "Nobody has booked this session yet."
                : "No guests match this search or filter."}
            </p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-x-2 gap-y-6">
              {visible.map((guest) => (
                <li key={guest.row.id}>
                  <GuestTile guest={guest} onOpen={() => setOpenId(guest.row.id)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <GuestSheet
        guest={openGuest}
        onClose={() => setOpenId(null)}
        showPayment={canReadPayments}
        interestClasses={interestClasses}
        busy={busyId !== null}
        checkingIn={openGuest !== null && busyId === openGuest.row.id && checkIn.isPending}
        onCheckIn={(id) =>
          runAttendance(id, checkIn.mutateAsync, () => notify.admin("booking.checked-in"))
        }
        onNoShow={(id) =>
          runAttendance(id, markNoShow.mutateAsync, () =>
            notify.success({
              title: "Marked no-show",
              description: "Attendance is recorded for this booking.",
            }),
          )
        }
      />
    </AdminPageShell>
  );
}

type RosterCounts = {
  capacity: number;
  confirmedCount: number;
  heldCount: number;
  available: number;
  waitlistedCount: number;
  checkedIn: number;
  noShow: number;
};

function RosterStats({ roster }: { roster: RosterCounts }) {
  const awaiting = Math.max(0, roster.confirmedCount - roster.checkedIn);
  const scale = Math.max(roster.capacity, roster.confirmedCount + roster.heldCount, 1);
  const segments = [
    { key: "checked-in", value: roster.checkedIn, className: "bg-primary", label: "Checked in" },
    { key: "awaiting", value: awaiting, className: "bg-primary/45", label: "To check in" },
    { key: "held", value: roster.heldCount, className: "bg-(--balanse-gold)", label: "Held" },
  ];

  return (
    <div className="grid gap-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-primary p-3 text-primary-foreground">
          <dt className="text-xs text-primary-foreground/70">Checked in</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {roster.checkedIn}
            <span className="text-base font-normal text-primary-foreground/70">
              {" "}
              / {roster.confirmedCount}
            </span>
          </dd>
        </div>
        <Stat label="Places left" value={roster.available} />
        <Stat label="Held" value={roster.heldCount} />
        <Stat label="Waitlist" value={roster.waitlistedCount} />
      </dl>
      <div className="grid gap-2">
        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${roster.checkedIn} checked in, ${awaiting} to check in, ${roster.heldCount} held, ${roster.available} places left, of ${roster.capacity}`}
        >
          {segments.map((segment) =>
            segment.value > 0 ? (
              <span
                key={segment.key}
                className={segment.className}
                style={{ width: `${(segment.value / scale) * 100}%` }}
              />
            ) : null,
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {segments.map((segment) => (
              <span key={segment.key} className="inline-flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${segment.className}`} aria-hidden />
                {segment.label}
              </span>
            ))}
          </span>
          <span className="tabular-nums">
            Capacity {roster.capacity}
            {roster.noShow > 0 ? ` · No-show ${roster.noShow}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Corner mark on a guest's avatar. `null` keeps the face clean (still to check in). */
function GuestMark({ guest }: { guest: Guest }) {
  if (guest.group === "to_check_in") return null;
  const base =
    "absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full text-[0.65rem] font-semibold ring-2 ring-background";
  if (guest.group === "checked_in") {
    return (
      <span aria-hidden="true" className={cn(base, "bg-primary text-primary-foreground")}>
        <Check className="size-3.5" />
      </span>
    );
  }
  if (guest.group === "no_show") {
    return (
      <span aria-hidden="true" className={cn(base, "bg-destructive text-background")}>
        <X className="size-3.5" />
      </span>
    );
  }
  if (guest.group === "held") {
    return (
      <span aria-hidden="true" className={cn(base, "bg-(--balanse-gold) text-foreground")}>
        <Hourglass className="size-3.5" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={cn(base, "bg-muted text-foreground tabular-nums")}>
      {guest.position}
    </span>
  );
}

function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  const faded = guest.group === "no_show";
  const name = guest.person
    ? { firstName: guest.person.firstName, lastName: guest.person.lastName }
    : { firstName: guestName(guest), lastName: "" };
  return (
    <span aria-hidden className={cn("relative inline-flex size-16 shrink-0", className)}>
      <UserAvatar
        name={name}
        avatarUrl={guest.person?.avatarUrl}
        seed={guest.row.customerId}
        className={cn(
          "size-full text-base font-semibold",
          faded && "opacity-50 grayscale line-through decoration-destructive/60",
        )}
      />
      <GuestMark guest={guest} />
    </span>
  );
}

/** Small eye-off mark so the front desk doesn't promise public visibility. */
function HiddenOnPublicRoster({ withLabel = false }: { withLabel?: boolean }) {
  if (withLabel) {
    return (
      <Badge appearance="soft" size="sm" variant="neutral">
        <EyeOff aria-hidden className="size-3" />
        Hidden on public roster
      </Badge>
    );
  }
  return (
    <span className="inline-flex items-center" title="Hidden on public roster">
      <EyeOff aria-hidden className="size-3" />
      <span className="sr-only">Hidden on public roster</span>
    </span>
  );
}

function GuestTile({ guest, onOpen }: { guest: Guest; onOpen: () => void }) {
  const name = guestName(guest);
  const nickname = guestNickname(guest);
  const hidden = isHiddenOnPublicRoster(guest);
  const caption = guestCaption(guest);
  const spoken = [
    name,
    nickname ? `goes by ${nickname}` : null,
    caption,
    hidden ? "hidden on public roster" : null,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${spoken}. Open guest details`}
      className="group/guest flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2 text-center outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <GuestAvatar
        guest={guest}
        className="transition-transform group-hover/guest:scale-[1.04] motion-reduce:transition-none motion-reduce:transform-none"
      />
      <span className="w-full">
        <span className="line-clamp-2 text-sm leading-snug font-medium">{name}</span>
        {nickname ? (
          <span className="line-clamp-1 text-xs text-muted-foreground italic">{nickname}</span>
        ) : null}
        <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          {caption}
          {hidden ? <HiddenOnPublicRoster /> : null}
        </span>
      </span>
    </button>
  );
}

function GuestSheet({
  guest,
  onClose,
  showPayment,
  interestClasses,
  busy,
  checkingIn,
  onCheckIn,
  onNoShow,
}: {
  guest: Guest | null;
  onClose: () => void;
  showPayment: boolean;
  interestClasses: InterestLookup;
  busy: boolean;
  checkingIn: boolean;
  onCheckIn: (bookingId: string) => void;
  onNoShow: (bookingId: string) => void;
}) {
  const name = guest ? guestName(guest) : "Guest";
  const nickname = guest ? guestNickname(guest) : null;
  return (
    <Sheet open={guest !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] overflow-y-auto sm:mx-auto sm:max-w-lg sm:rounded-t-2xl"
      >
        {guest ? (
          <>
            <SheetHeader className="flex-row items-center gap-4">
              <GuestAvatar guest={guest} className="size-14" />
              <div className="min-w-0">
                <SheetTitle className="font-display text-xl">{name}</SheetTitle>
                <SheetDescription>
                  {nickname ? <span className="italic">{nickname}</span> : null}
                  {nickname ? " · " : null}
                  {guestCaption(guest)}
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 text-sm">
              <StatusBadge status={guest.row.status} surface="admin" />
              {showPayment && guest.row.paymentStatus !== "NONE" ? (
                <span className="text-muted-foreground">
                  Payment: {paymentStatusLabel(guest.row.paymentStatus)}
                </span>
              ) : null}
              {isHiddenOnPublicRoster(guest) ? <HiddenOnPublicRoster withLabel /> : null}
            </div>
            <CustomerAboutCard
              variant="compact"
              className="px-4"
              onboarding={guest.person?.onboarding ?? null}
              classes={interestClasses.classes}
              classHref={interestClasses.classHref}
            />
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 text-sm">
              <AdminCan href="/bookings">
                <Link className="underline underline-offset-4" href={`/bookings/${guest.row.id}`}>
                  View booking
                </Link>
              </AdminCan>
              <AdminCan href="/customers">
                <Link
                  className="underline underline-offset-4"
                  href={`/customers/${guest.row.customerId}`}
                >
                  Customer profile
                </Link>
              </AdminCan>
            </div>
            {guest.row.status === "CONFIRMED" ? (
              <AdminCan action="attendance">
                <SheetFooter className="flex-row flex-wrap justify-end gap-2">
                  <ConfirmAction
                    triggerLabel="No-show"
                    title={`Mark ${name} as no-show?`}
                    description={NO_REFUND_ON_NOSHOW_NOTE}
                    confirmLabel="Mark no-show"
                    variant="outline"
                    disabled={busy}
                    onConfirm={() => onNoShow(guest.row.id)}
                  />
                  <Button
                    type="button"
                    loading={checkingIn}
                    disabled={busy}
                    onClick={() => onCheckIn(guest.row.id)}
                  >
                    Check in
                  </Button>
                </SheetFooter>
              </AdminCan>
            ) : guest.group === "held" ? (
              <p className="px-4 pb-4 text-xs text-muted-foreground">
                Holding a place but not confirmed. Resolve payment before class; no attendance
                actions until then.
              </p>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
