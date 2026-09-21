"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  addManilaDays,
  daysInManilaMonth,
  formatSessionDate,
  manilaYmd,
  manilaYmdToUtcDate,
  startOfManilaMonth,
  startOfManilaWeekMonday,
} from "@balanse/domain";
import { CalendarIcon, XIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { useMinWidth } from "../../hooks/use-breakpoint/UseBreakpoint";
import { cn } from "../../lib/utils";
import { Calendar } from "../calendar/Calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../input-group/InputGroup";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../popover/Popover";
import type {
  DatePickerProps,
  DatePickerValues,
  DateRangePickerProps,
  DateRangePickerValues,
} from "./DatePicker.schema";

const YMD_RE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const RANGE_TYPED_RE = /^(\d{4}-\d{2}-\d{2})\s*(?:to|–|\/)\s*(\d{4}-\d{2}-\d{2})$/i;

function ymdFromLocalDate(date: Date): DatePickerValues {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromYmd(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseTypedYmd(raw: string): DatePickerValues | undefined {
  const match = raw.trim().match(YMD_RE);
  if (!match) {
    return undefined;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const local = new Date(year, month - 1, day);
  if (local.getFullYear() !== year || local.getMonth() !== month - 1 || local.getDate() !== day) {
    return undefined;
  }
  return ymdFromLocalDate(local);
}

function parseTypedRange(raw: string): DateRangePickerValues | undefined {
  const match = raw.trim().match(RANGE_TYPED_RE);
  if (!match) {
    return undefined;
  }
  const from = parseTypedYmd(match[1] ?? "");
  const to = parseTypedYmd(match[2] ?? "");
  if (!from || !to) {
    return undefined;
  }
  return from <= to ? { from, to } : { from: to, to: from };
}

function formatDateLabel(ymd: DatePickerValues): string {
  return formatSessionDate(manilaYmdToUtcDate(ymd));
}

function formatRangeLabel(range: DateRangePickerValues): string {
  return `${formatDateLabel(range.from)} – ${formatDateLabel(range.to)}`;
}

function isYmdBlocked(
  ymd: DatePickerValues,
  min?: DatePickerValues,
  max?: DatePickerValues,
  disabledDates?: DatePickerValues[],
): boolean {
  if (min && ymd < min) {
    return true;
  }
  if (max && ymd > max) {
    return true;
  }
  return Boolean(disabledDates?.includes(ymd));
}

function useTwoMonthPanel(containerRef: React.RefObject<HTMLElement | null>) {
  const [containerWide, setContainerWide] = React.useState(false);
  const viewportWide = useMinWidth(BALANSE_BREAKPOINTS.tablet);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      setContainerWide(node.getBoundingClientRect().width >= BALANSE_BREAKPOINTS.tablet);
    };

    const observer = new ResizeObserver(update);
    observer.observe(node);
    update();
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return containerWide && viewportWide;
}

function resolveToday(today?: DatePickerValues): DatePickerValues {
  return today ?? manilaYmd(new Date());
}

function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  disabledDates,
  invalid,
  today: todayProp,
  disabled,
  readOnly,
  id,
  name,
  placeholder,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  onFocus,
  onBlur,
  ...inputProps
}: DatePickerProps) {
  const startedControlled = React.useRef(valueProp !== undefined);
  const isControlled = startedControlled.current || valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const setValue = React.useCallback(
    (next: DatePickerValues | undefined) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const today = resolveToday(todayProp);
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");

  React.useEffect(() => {
    if (!focused) {
      setDraft(value ?? "");
    }
  }, [value, focused]);

  const displayValue = focused ? draft : value ? formatDateLabel(value) : draft;
  const isInvalid = Boolean(invalid ?? ariaInvalid);

  const commitDraft = React.useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        setValue(undefined);
        setDraft("");
        return;
      }
      const parsed = parseTypedYmd(trimmed);
      if (!parsed || isYmdBlocked(parsed, min, max, disabledDates)) {
        setDraft(value ?? "");
        return;
      }
      setValue(parsed);
      setDraft(parsed);
    },
    [disabledDates, max, min, setValue, value],
  );

  const tryCommitLive = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      setValue(undefined);
      return;
    }
    const parsed = parseTypedYmd(raw);
    if (parsed && !isYmdBlocked(parsed, min, max, disabledDates)) {
      setValue(parsed);
    }
  };

  return (
    <InputGroup
      className={cn(className)}
      data-slot="date-picker"
      data-disabled={disabled || undefined}
    >
      <InputGroupInput
        {...inputProps}
        id={id}
        name={name}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={displayValue}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        onFocus={(event) => {
          setFocused(true);
          setDraft(value ?? "");
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          commitDraft(draft);
          onBlur?.(event);
        }}
        onChange={(event) => {
          if (readOnly) {
            return;
          }
          tryCommitLive(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft(draft);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        {value && !disabled && !readOnly ? (
          <InputGroupButton
            type="button"
            variant="ghost"
            aria-label="Clear date"
            onClick={() => {
              setValue(undefined);
              setDraft("");
            }}
          >
            <XIcon />
          </InputGroupButton>
        ) : null}
        <Popover
          open={open}
          onOpenChange={(next) => {
            if (disabled || readOnly) {
              return;
            }
            setOpen(next);
          }}
        >
          {/* TODO(FE-SHR-008): inherit default trigger size; do not pass size. */}
          <InputGroupButton
            type="button"
            variant="ghost"
            disabled={disabled || readOnly}
            aria-label="Open calendar"
            render={<PopoverTrigger />}
          >
            <CalendarIcon />
          </InputGroupButton>
          <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1rem)]">
            <PopoverTitle className="sr-only">Choose date</PopoverTitle>
            <Calendar
              mode="single"
              today={localDateFromYmd(today)}
              defaultMonth={localDateFromYmd(value ?? today)}
              selected={value ? localDateFromYmd(value) : undefined}
              onSelect={(date) => {
                if (!date) {
                  return;
                }
                const next = ymdFromLocalDate(date);
                if (isYmdBlocked(next, min, max, disabledDates)) {
                  return;
                }
                setValue(next);
                setDraft(next);
                setOpen(false);
              }}
              disabled={(date) => isYmdBlocked(ymdFromLocalDate(date), min, max, disabledDates)}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}

function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  disabledDates,
  invalid,
  today: todayProp,
  disabled,
  readOnly,
  id,
  name,
  placeholder,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  onFocus,
  onBlur,
  ...inputProps
}: DateRangePickerProps) {
  const startedControlled = React.useRef(valueProp !== undefined);
  const isControlled = startedControlled.current || valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const setValue = React.useCallback(
    (next: DateRangePickerValues | undefined) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const today = resolveToday(todayProp);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const twoMonths = useTwoMonthPanel(hostRef);
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState(value ? `${value.from} to ${value.to}` : "");
  const [pending, setPending] = React.useState<DateRange | undefined>(
    value ? { from: localDateFromYmd(value.from), to: localDateFromYmd(value.to) } : undefined,
  );

  React.useEffect(() => {
    if (!focused) {
      setDraft(value ? `${value.from} to ${value.to}` : "");
    }
    setPending(
      value ? { from: localDateFromYmd(value.from), to: localDateFromYmd(value.to) } : undefined,
    );
  }, [value, focused]);

  const displayValue = focused ? draft : value ? formatRangeLabel(value) : draft;
  const isInvalid = Boolean(invalid ?? ariaInvalid);

  const applyRange = (next: DateRangePickerValues | undefined) => {
    setValue(next);
    setDraft(next ? `${next.from} to ${next.to}` : "");
  };

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      applyRange(undefined);
      return;
    }
    const parsed = parseTypedRange(trimmed);
    if (
      !parsed ||
      isYmdBlocked(parsed.from, min, max, disabledDates) ||
      isYmdBlocked(parsed.to, min, max, disabledDates)
    ) {
      setDraft(value ? `${value.from} to ${value.to}` : "");
      return;
    }
    applyRange(parsed);
  };

  const tryCommitLive = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      applyRange(undefined);
      return;
    }
    const parsed = parseTypedRange(raw);
    if (
      parsed &&
      !isYmdBlocked(parsed.from, min, max, disabledDates) &&
      !isYmdBlocked(parsed.to, min, max, disabledDates)
    ) {
      applyRange(parsed);
    }
  };

  const presets = React.useMemo(() => {
    const weekStart = startOfManilaWeekMonday(today);
    const monthStart = startOfManilaMonth(today);
    const monthEnd = addManilaDays(monthStart, daysInManilaMonth(today) - 1);
    return [
      { key: "today", label: "Today", range: { from: today, to: today } },
      {
        key: "week",
        label: "This week",
        range: { from: weekStart, to: addManilaDays(weekStart, 6) },
      },
      { key: "month", label: "This month", range: { from: monthStart, to: monthEnd } },
    ] satisfies { key: string; label: string; range: DateRangePickerValues }[];
  }, [today]);

  return (
    <InputGroup
      ref={hostRef}
      className={cn(className)}
      data-slot="date-range-picker"
      data-disabled={disabled || undefined}
    >
      <InputGroupInput
        {...inputProps}
        id={id}
        name={name}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={displayValue}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        onFocus={(event) => {
          setFocused(true);
          setDraft(value ? `${value.from} to ${value.to}` : "");
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          commitDraft();
          onBlur?.(event);
        }}
        onChange={(event) => {
          if (readOnly) {
            return;
          }
          tryCommitLive(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft();
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        {value && !disabled && !readOnly ? (
          <InputGroupButton
            type="button"
            variant="ghost"
            aria-label="Clear date range"
            onClick={() => applyRange(undefined)}
          >
            <XIcon />
          </InputGroupButton>
        ) : null}
        <Popover
          open={open}
          onOpenChange={(next) => {
            if (disabled || readOnly) {
              return;
            }
            setOpen(next);
          }}
        >
          <InputGroupButton
            type="button"
            variant="ghost"
            disabled={disabled || readOnly}
            aria-label="Open date range calendar"
            render={<PopoverTrigger />}
          >
            <CalendarIcon />
          </InputGroupButton>
          <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1rem)]">
            <PopoverTitle className="sr-only">Choose date range</PopoverTitle>
            <div className="flex flex-wrap gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                  aria-label={`Preset: ${preset.label}`}
                  onClick={() => {
                    applyRange(preset.range);
                    setPending({
                      from: localDateFromYmd(preset.range.from),
                      to: localDateFromYmd(preset.range.to),
                    });
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Calendar
              mode="range"
              numberOfMonths={twoMonths ? 2 : 1}
              today={localDateFromYmd(today)}
              defaultMonth={localDateFromYmd(value?.from ?? today)}
              selected={pending}
              onSelect={(range) => {
                setPending(range);
                if (!range?.from || !range.to) {
                  return;
                }
                const next = {
                  from: ymdFromLocalDate(range.from),
                  to: ymdFromLocalDate(range.to),
                };
                if (
                  isYmdBlocked(next.from, min, max, disabledDates) ||
                  isYmdBlocked(next.to, min, max, disabledDates)
                ) {
                  return;
                }
                applyRange(next);
                setOpen(false);
              }}
              disabled={(date) => isYmdBlocked(ymdFromLocalDate(date), min, max, disabledDates)}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}

export {
  type DatePickerProps,
  type DatePickerValues,
  type DateRangePickerProps,
  type DateRangePickerValues,
  datePickerSchema,
  dateRangeSchema,
} from "./DatePicker.schema";
export { DatePicker, DateRangePicker };
