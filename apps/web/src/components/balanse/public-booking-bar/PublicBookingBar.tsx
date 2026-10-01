import { formatSessionDate, formatSessionTime, registrationWindowState } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { PublicBookingAction, PublicBookingBarProps } from "./PublicBookingBar.meta";

function opensLabel(iso: string): string {
  return `${formatSessionDate(iso)}, ${formatSessionTime(iso)}`;
}

/** Decides the one booking action for a public session/event page. */
export function resolvePublicBookingAction(input: PublicBookingBarProps): PublicBookingAction {
  const { session, viewer, existingBookingId, registrationWindow, nowIso } = input;
  if (session.status === "CANCELLED" || session.availability === "cancelled" || input.cancelled) {
    return { kind: "none", note: "This session was cancelled." };
  }
  if (session.availability === "past") {
    return {
      kind: "link",
      label: `See upcoming ${session.className} sessions`,
      href: `/book/calendar?classId=${encodeURIComponent(session.classId)}`,
      variant: "outline",
      note: "This session has ended.",
    };
  }
  if (existingBookingId) {
    return {
      kind: "link",
      label: "View my booking",
      href: `/portal/bookings/${encodeURIComponent(existingBookingId)}`,
      variant: "default",
      note: "You’re booked for this session.",
    };
  }
  if (registrationWindow) {
    const windowState = registrationWindowState(registrationWindow, nowIso);
    if (windowState.state === "not_open") {
      return {
        kind: "disabled",
        label: `Registration opens ${opensLabel(windowState.opensAt)}`,
      };
    }
    if (windowState.state === "closed") return { kind: "disabled", label: "Registration closed" };
  }
  if (session.availability === "past_cutoff") {
    return { kind: "disabled", label: "Booking closed", note: "Online booking has closed." };
  }
  const waitlist = session.availability === "full_with_waitlist";
  const bookPath = `/portal/book/${encodeURIComponent(session.id)}${waitlist ? "?intent=waitlist" : ""}`;
  return {
    kind: "link",
    label: waitlist ? "Join waitlist" : "Book this session",
    href: viewer ? bookPath : `/login?returnTo=${encodeURIComponent(bookPath)}`,
    variant: "accent",
    note: waitlist ? "This session is full. Join the waitlist." : undefined,
  };
}

/**
 * Booking action for public pages. Inline on desktop; a sticky bottom bar on
 * mobile so the action stays reachable while scrolling the roster.
 */
export function PublicBookingBar(props: PublicBookingBarProps) {
  const action = resolvePublicBookingAction(props);
  const content = (
    <>
      {action.note ? <p className="text-sm text-muted-foreground">{action.note}</p> : null}
      {action.kind === "link" ? (
        <Button
          variant={action.variant}
          size="lg"
          nativeButton={false}
          render={<Link href={action.href} />}
        >
          {action.label} <ArrowUpRight aria-hidden="true" className="size-4" />
        </Button>
      ) : action.kind === "disabled" ? (
        <Button size="lg" variant="secondary" disabled>
          {action.label}
        </Button>
      ) : null}
    </>
  );
  if (action.kind === "none") {
    return <p className="text-sm font-medium text-muted-foreground">{action.note}</p>;
  }
  return (
    <>
      <div className="hidden flex-wrap items-center gap-4 md:flex">{content}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(28,35,49,0.08)] backdrop-blur md:hidden [&_[data-slot=button]]:w-full [&_a]:w-full">
        {content}
      </div>
      <div aria-hidden="true" className="h-24 md:hidden" />
    </>
  );
}
