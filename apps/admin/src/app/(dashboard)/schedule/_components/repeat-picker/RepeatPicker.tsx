"use client";

import {
  addCalendarDays,
  calendarDayDistance,
  isManilaYmd,
  WEEKDAYS,
  type Weekday,
  weekdayForYmd,
} from "@balanse/domain";
import { Chip, chipVariants, DatePicker } from "@balanse/ui";
import { useId } from "react";
import type { RepeatPickerProps, RepeatValue } from "./RepeatPicker.meta";

export type { RepeatMode, RepeatValue } from "./RepeatPicker.meta";

const WEEKDAYS_MON_FRI: Weekday[] = [1, 2, 3, 4, 5];
const LENGTH_PRESETS = [
  { weeks: 4, label: "4 weeks" },
  { weeks: 8, label: "8 weeks" },
  { weeks: 12, label: "12 weeks" },
  { weeks: 26, label: "6 months" },
] as const;

type Preset = "none" | "same-day" | "weekdays" | "custom";

export function RepeatPicker({
  value,
  onChange,
  anchorYmd,
  allowNone = true,
  errors,
  today,
}: RepeatPickerProps) {
  const anchorOk = isManilaYmd(anchorYmd);
  const anchorDay = anchorOk ? weekdayForYmd(anchorYmd) : 1;
  const anchorLabel = WEEKDAYS.find((day) => day.value === anchorDay)?.label ?? "that day";
  const preset = presetFor(value, anchorDay);
  const groupName = useId();

  function choose(next: Preset) {
    const endsOn =
      value.endsOn && anchorOk && value.endsOn >= anchorYmd
        ? value.endsOn
        : anchorOk
          ? addCalendarDays(anchorYmd, 7 * 8 - 1)
          : "";
    if (next === "none") onChange({ ...value, mode: "none" });
    else if (next === "same-day") onChange({ mode: "weekly", weekdays: [anchorDay], endsOn });
    else if (next === "weekdays") onChange({ mode: "weekly", weekdays: WEEKDAYS_MON_FRI, endsOn });
    else
      onChange({
        mode: "weekly",
        weekdays: value.weekdays.length ? value.weekdays : [anchorDay],
        endsOn,
      });
  }

  function toggleDay(day: Weekday) {
    const has = value.weekdays.includes(day);
    const weekdays = has ? value.weekdays.filter((row) => row !== day) : [...value.weekdays, day];
    onChange({ ...value, mode: "weekly", weekdays: sortWeekdays(weekdays) });
  }

  const weeks =
    anchorOk && isManilaYmd(value.endsOn)
      ? Math.floor(calendarDayDistance(anchorYmd, value.endsOn) / 7) + 1
      : null;

  return (
    <div className="grid gap-4">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Repeat</legend>
        {allowNone ? (
          <PresetChip name={groupName} checked={preset === "none"} onSelect={() => choose("none")}>
            Does not repeat
          </PresetChip>
        ) : null}
        <PresetChip
          name={groupName}
          checked={preset === "same-day"}
          onSelect={() => choose("same-day")}
        >
          Weekly on {anchorLabel}
        </PresetChip>
        <PresetChip
          name={groupName}
          checked={preset === "weekdays"}
          onSelect={() => choose("weekdays")}
        >
          Every weekday
        </PresetChip>
        <PresetChip
          name={groupName}
          checked={preset === "custom"}
          onSelect={() => choose("custom")}
        >
          Custom days
        </PresetChip>
      </fieldset>

      {value.mode === "weekly" ? (
        <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Repeat on</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const on = value.weekdays.includes(day.value);
                return (
                  <Chip
                    key={day.value}
                    size="square"
                    selected={on}
                    aria-label={day.label}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.shortLabel.slice(0, 2)}
                  </Chip>
                );
              })}
            </div>
            {errors?.weekdays ? (
              <p className="text-sm text-destructive">{errors.weekdays}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Ends</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {LENGTH_PRESETS.map((row) => {
                const endsOn = anchorOk ? addCalendarDays(anchorYmd, row.weeks * 7 - 1) : "";
                return (
                  <Chip
                    key={row.weeks}
                    size="sm"
                    selected={value.endsOn === endsOn}
                    disabled={!anchorOk}
                    onClick={() => onChange({ ...value, mode: "weekly", endsOn })}
                  >
                    {row.label}
                  </Chip>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">or on</span>
              <DatePicker
                className="w-52"
                aria-label="Series ends on"
                today={today}
                min={anchorOk ? anchorYmd : undefined}
                value={value.endsOn || undefined}
                onValueChange={(next) => onChange({ ...value, mode: "weekly", endsOn: next ?? "" })}
              />
              {weeks && weeks > 0 ? (
                <span className="text-muted-foreground">
                  · {weeks} {weeks === 1 ? "week" : "weeks"}
                </span>
              ) : null}
            </div>
            {errors?.endsOn ? <p className="text-sm text-destructive">{errors.endsOn}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PresetChip({
  name,
  checked,
  onSelect,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className={chipVariants({ selected: checked })}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      {children}
    </label>
  );
}

function presetFor(value: RepeatValue, anchorDay: Weekday): Preset {
  if (value.mode === "none") return "none";
  const days = sortWeekdays(value.weekdays);
  if (days.length === 1 && days[0] === anchorDay) return "same-day";
  if (days.length === 5 && WEEKDAYS_MON_FRI.every((day) => days.includes(day))) return "weekdays";
  return "custom";
}

function sortWeekdays(days: Weekday[]): Weekday[] {
  const order = WEEKDAYS.map((day) => day.value) as Weekday[];
  return [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
