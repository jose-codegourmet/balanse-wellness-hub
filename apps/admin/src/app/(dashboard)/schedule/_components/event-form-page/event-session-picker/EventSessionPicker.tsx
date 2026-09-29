"use client";

import { EVENT_CONFLICT_MESSAGES, formatSessionTimeRange, manilaYmd } from "@balanse/domain";
import { Badge, Button, Input } from "@balanse/ui";
import { CheckIcon, EyeIcon, EyeOffIcon, MapPinIcon, PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { EventSessionPickerProps, SessionChoice } from "./EventSessionPicker.meta";

export type { SessionChoice } from "./EventSessionPicker.meta";

export function EventSessionPicker({
  choices,
  value,
  onChange,
  invalid = false,
  onCreateSession,
  defaultShowUnavailable = false,
}: EventSessionPickerProps) {
  const groupName = useId();
  const [search, setSearch] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(defaultShowUnavailable);
  const needle = search.trim().toLowerCase();
  const matching = choices.filter((choice) => {
    if (!needle) return true;
    return [
      choice.className,
      choice.statusLabel,
      choice.eventTitle ?? "",
      choice.venue?.name ?? "",
      dayLabel(choice),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const unavailableCount = matching.filter((choice) => choice.blocked !== null).length;
  const visible = matching.filter((choice) => showUnavailable || choice.blocked === null);
  const groups = groupByWeek(visible);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search sessions"
            invalid={false}
            className="pl-9"
            placeholder="Search class, day, venue, or event"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {unavailableCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={showUnavailable}
            onClick={() => setShowUnavailable((current) => !current)}
          >
            {showUnavailable ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
            {showUnavailable ? "Hide" : "Show"} {unavailableCount} unavailable
          </Button>
        ) : null}
        {onCreateSession ? (
          <Button type="button" variant="outline" size="sm" onClick={onCreateSession}>
            <PlusIcon aria-hidden />
            New session
          </Button>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            {needle ? "No sessions match that search." : "No open sessions can take an event yet."}
          </p>
          {onCreateSession ? (
            <Button type="button" variant="outline" size="sm" onClick={onCreateSession}>
              <PlusIcon aria-hidden />
              Create a session for this event
            </Button>
          ) : null}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Session"
          aria-invalid={invalid || undefined}
          className="grid gap-5"
        >
          {groups.map((group) => (
            <section key={group.weekStart} className="grid gap-2">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {group.label}
              </h3>
              <div className="grid gap-2">
                {group.choices.map((choice) => (
                  <SessionOption
                    key={choice.id}
                    choice={choice}
                    name={groupName}
                    checked={value === choice.id}
                    onSelect={() => onChange(choice.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionOption({
  choice,
  name,
  checked,
  onSelect,
}: {
  choice: SessionChoice;
  name: string;
  checked: boolean;
  onSelect: () => void;
}) {
  const unavailable = choice.blocked !== null;
  const day = dateChip(choice.startsAt);

  return (
    <div
      className={cn(
        "rounded-xl border bg-background transition-colors",
        checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
        unavailable ? "opacity-70" : "hover:border-primary/50",
      )}
    >
      <label
        className={cn(
          "relative flex items-center gap-4 p-3",
          unavailable ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <input
          type="radio"
          name={name}
          value={choice.id}
          checked={checked}
          disabled={unavailable}
          onChange={onSelect}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="grid w-14 shrink-0 place-items-center rounded-lg border border-border bg-card py-1.5 text-center leading-none"
        >
          <span className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            {day.weekday}
          </span>
          <span className="font-display text-2xl">{day.day}</span>
          <span className="text-[0.625rem] text-muted-foreground uppercase">{day.month}</span>
        </span>
        <span className="grid min-w-0 flex-1 gap-0.5 text-sm">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{choice.className}</span>
            <Badge variant={statusVariant(choice.status)}>{choice.statusLabel}</Badge>
          </span>
          <span className="text-muted-foreground">
            {formatSessionTimeRange(choice.startsAt, choice.endsAt)}
          </span>
          <span className="text-muted-foreground">
            {choice.capacity} {choice.capacity === 1 ? "spot" : "spots"} · {choice.priceLabel}
          </span>
          {choice.venue ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{choice.venue.name}</span>
              {choice.venue.kind === "OFFSITE" ? (
                <Badge variant="accent" className="ml-1">
                  Off-site
                </Badge>
              ) : null}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
          )}
        >
          {checked ? <CheckIcon className="size-3.5" /> : null}
        </span>
      </label>
      {choice.blocked === "taken" ? (
        <p className="border-t border-border px-3 py-2 text-sm">
          {EVENT_CONFLICT_MESSAGES.event_session_taken}{" "}
          {choice.eventId ? (
            <Link className="underline underline-offset-4" href={`/events/${choice.eventId}`}>
              Open {choice.eventTitle ?? "the event"}
            </Link>
          ) : null}
        </p>
      ) : null}
      {choice.blocked === "cancelled" ? (
        <p className="border-t border-border px-3 py-2 text-sm">
          {EVENT_CONFLICT_MESSAGES.event_on_cancelled_session}
        </p>
      ) : null}
    </div>
  );
}

const MANILA = "Asia/Manila";

function statusVariant(status: SessionChoice["status"]) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "warning" as const;
}

function dateChip(iso: string) {
  const date = new Date(iso);
  return {
    weekday: new Intl.DateTimeFormat("en-US", { timeZone: MANILA, weekday: "short" }).format(date),
    day: new Intl.DateTimeFormat("en-US", { timeZone: MANILA, day: "numeric" }).format(date),
    month: new Intl.DateTimeFormat("en-US", { timeZone: MANILA, month: "short" }).format(date),
  };
}

function dayLabel(choice: SessionChoice): string {
  const chip = dateChip(choice.startsAt);
  return `${chip.weekday} ${chip.month} ${chip.day}`;
}

/** Monday of the Manila calendar week, as YYYY-MM-DD. */
function weekStartYmd(iso: string): string {
  const [year, month, day] = manilaYmd(iso).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

function groupByWeek(choices: readonly SessionChoice[]) {
  const groups = new Map<string, SessionChoice[]>();
  for (const choice of choices) {
    const key = weekStartYmd(choice.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), choice]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, rows]) => ({
      weekStart,
      label: `Week of ${new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
      }).format(new Date(`${weekStart}T00:00:00Z`))}`,
      choices: rows,
    }));
}
