"use client";

import {
  type CoachStudentSession,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { Badge, Button, FeedbackState, StatusBadge, UserAvatar } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck2, CalendarClock, CircleDollarSign } from "lucide-react";
import Link from "next/link";
import {
  CustomerAboutCard,
  useInterestClassLookup,
} from "@/components/balanse/customer/customer-about-card/CustomerAboutCard";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { coachStudentDetailQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { CoachStudentDetailPageProps } from "./CoachStudentDetailPage.meta";

function SessionRows({ rows, empty }: { rows: readonly CoachStudentSession[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="divide-y divide-border/70">
      {rows.map((session) => (
        <li
          key={session.bookingId}
          className="flex flex-wrap items-center justify-between gap-3 py-3.5"
        >
          <div>
            <p className="font-medium">{session.className}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatSessionDate(session.startsAt)} · {formatSessionTime(session.startsAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {session.contributionPhp > 0 ? (
              <Badge appearance="soft" size="sm" variant="info">
                {formatPeso(session.contributionPhp)}
              </Badge>
            ) : null}
            <StatusBadge status={session.status} surface="admin" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CoachStudentDetailPage({ customerId }: CoachStudentDetailPageProps) {
  const { principal } = useMockPrincipal();
  const detailQuery = useSuspenseQuery(coachStudentDetailQuery(principal, customerId));
  const interestClasses = useInterestClassLookup();
  const student = detailQuery.data;

  if (!student) {
    return (
      <AdminPageShell
        breadcrumb={[{ label: "My Students", href: "/students" }, { label: "Student" }]}
        title="Student"
      >
        <FeedbackState
          id="customer.no-bookings"
          title="Student not available"
          description="This student does not have upcoming bookings or recorded attendance in your classes."
        />
      </AdminPageShell>
    );
  }

  const nickname = student.nickname?.trim();
  const nextLabel = student.nextBooking
    ? `${student.nextBooking.className} · ${formatSessionDate(student.nextBooking.startsAt)} ${formatSessionTime(student.nextBooking.startsAt)}`
    : "No upcoming class";

  return (
    <AdminPageShell
      actions={
        <Button nativeButton={false} render={<Link href="/students" />} size="sm" variant="outline">
          <ArrowLeft aria-hidden />
          My Students
        </Button>
      }
      breadcrumb={[{ label: "My Students", href: "/students" }, { label: student.fullName }]}
      description="Attendance and contribution are limited to your own classes."
      eyebrow="Student profile"
      title={student.fullName}
      leading={
        <span aria-hidden>
          <UserAvatar
            name={{ firstName: student.firstName, lastName: student.lastName }}
            avatarUrl={student.avatarUrl}
            seed={student.id}
            size="xl"
            className="shadow-sm ring-2 ring-background"
          />
        </span>
      }
      subtitle={
        nickname ? (
          <span className="text-sm text-muted-foreground">
            Goes by <span className="font-medium text-foreground italic">{nickname}</span>
          </span>
        ) : undefined
      }
      stats={
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <CalendarCheck2 aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{student.sessionsAttended}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sessions attended</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <CircleDollarSign aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {formatPeso(student.contributionPhp)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Class contribution</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <CalendarClock aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-sm font-semibold leading-6">{nextLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">Next booking</p>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerAboutCard
          className="lg:col-span-2"
          onboarding={student.onboarding}
          classes={interestClasses.classes}
          classHref={interestClasses.classHref}
          showHeardFrom={false}
        />
        <section className="rounded-xl border border-border/70 bg-card p-5">
          <div className="mb-4">
            <h2 className="font-display text-2xl">Upcoming classes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.upcomingBookingCount} upcoming booking
              {student.upcomingBookingCount === 1 ? "" : "s"} in your classes.
            </p>
          </div>
          <SessionRows empty="No upcoming classes with you." rows={student.upcoming} />
        </section>
        <section className="rounded-xl border border-border/70 bg-card p-5">
          <div className="mb-4">
            <h2 className="font-display text-2xl">Attendance history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Last attended{" "}
              {student.lastAttendedAt ? formatSessionDate(student.lastAttendedAt) : "—"}.
            </p>
          </div>
          <SessionRows empty="No recorded attendance in your classes." rows={student.attendance} />
        </section>
      </div>
    </AdminPageShell>
  );
}
