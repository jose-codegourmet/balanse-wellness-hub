import { nameFromInitials, type PublicRoster as PublicRosterData } from "@balanse/domain";
import { Badge, Button, UserAvatar, UserAvatarStack } from "@balanse/ui";
import { EyeOff, Users } from "lucide-react";
import Link from "next/link";
import type { PublicRosterProps } from "./PublicRoster.meta";

function goingLine(roster: PublicRosterData): string {
  const going = `${roster.goingCount} going`;
  if (roster.spotsLeft <= 0) return `${going} · Full`;
  return `${going} · ${roster.spotsLeft} ${roster.spotsLeft === 1 ? "spot" : "spots"} left`;
}

/**
 * "Who's going" block for public session and event pages. Guests get counts
 * and a sign-in prompt; signed-in customers get display names and avatars.
 */
export function PublicRoster({
  roster,
  loginHref,
  signUpHref,
  state = "live",
  profileHref = "/portal/profile",
  headingId = "public-roster-title",
}: PublicRosterProps) {
  const muted = state !== "live";
  return (
    <section
      aria-labelledby={headingId}
      data-state={state}
      className="rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Who&rsquo;s going
          </p>
          <h2 id={headingId} className="mt-1 font-display text-2xl">
            {roster.visibility === "list"
              ? `Who’s going (${roster.goingCount})`
              : goingLine(roster)}
          </h2>
          {roster.visibility === "list" ? (
            <p className="mt-1 text-sm text-muted-foreground">{goingLine(roster)}</p>
          ) : null}
        </div>
        <Users aria-hidden="true" className="size-6 text-muted-foreground" />
      </div>

      {state === "cancelled" ? (
        <p className="mt-4 text-sm text-muted-foreground">This session was cancelled.</p>
      ) : null}

      {roster.visibility === "counts" ? (
        <div className="mt-5 flex flex-col gap-4">
          {roster.goingCount > 0 ? (
            <UserAvatarStack
              people={[]}
              placeholderCount={Math.min(roster.goingCount, 5)}
              overflowCount={Math.max(0, roster.goingCount - 5)}
              size="lg"
              label={`${roster.goingCount} going`}
            />
          ) : null}
          <p className="text-sm text-muted-foreground">
            {roster.goingCount > 0
              ? "Sign in to see who’s going. Members appear by first name or nickname."
              : "No one’s booked yet — be the first."}
          </p>
          {roster.goingCount > 0 ? (
            <div className="flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link href={loginHref} />}>
                Sign in to see who&rsquo;s going
              </Button>
              <Button variant="ghost" nativeButton={false} render={<Link href={signUpHref} />}>
                Create an account
              </Button>
            </div>
          ) : null}
        </div>
      ) : roster.attendees.length === 0 && roster.hiddenCount === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          {muted ? "No one was booked." : "No one’s booked yet — be the first."}
        </p>
      ) : (
        <ul
          className={`mt-5 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-3 gap-y-5 ${
            muted ? "opacity-70" : ""
          }`}
        >
          {roster.attendees.map((attendee) => (
            <li key={attendee.key} className="flex flex-col items-center gap-2 text-center">
              <UserAvatar
                name={nameFromInitials(attendee.initials)}
                avatarUrl={attendee.avatarUrl}
                seed={attendee.key}
                label={attendee.displayName}
                size="xl"
                className={attendee.isSelf ? "ring-2 ring-accent ring-offset-2" : undefined}
              />
              <span className="max-w-full truncate text-sm font-medium">
                {attendee.displayName}
              </span>
              {attendee.isSelf ? (
                <Badge variant="accent" appearance="soft">
                  You
                </Badge>
              ) : null}
              {attendee.hiddenFromOthers ? (
                <p className="text-xs leading-snug text-muted-foreground">
                  <EyeOff aria-hidden="true" className="mr-1 inline size-3" />
                  Only you can see this — you&rsquo;re hidden from others.{" "}
                  <Link href={profileHref} className="underline underline-offset-2">
                    Change
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
          {roster.hiddenCount > 0 ? (
            <li className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-muted font-display text-2xl text-muted-foreground">
                +{roster.hiddenCount}
              </span>
              <span className="text-sm text-muted-foreground">
                {roster.hiddenCount === 1 ? "1 other" : `${roster.hiddenCount} others`}
              </span>
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
