"use client";

import { formatSessionTime } from "@balanse/domain";
import { ClockIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../input-group/InputGroup";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../popover/Popover";
import type { TimePickerProps, TimePickerValues } from "./TimePicker.schema";

const CLOCK_RE = /^(\d{1,2}):(\d{2})$/;
const CLOCK_COMPACT_RE = /^(\d{2})(\d{2})$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function timeToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function isStrictlyAfter(candidate: TimePickerValues, after: TimePickerValues): boolean {
  return timeToMinutes(candidate) > timeToMinutes(after);
}

function parseTypedTime(raw: string): TimePickerValues | undefined {
  const trimmed = raw.trim();
  const match = trimmed.match(CLOCK_RE) ?? trimmed.match(CLOCK_COMPACT_RE);
  if (!match) {
    return undefined;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return undefined;
  }
  return `${pad2(hours)}:${pad2(minutes)}`;
}

function formatClockLabel(hhmm: TimePickerValues): string {
  return formatSessionTime(`2026-09-16T${hhmm}:00+08:00`);
}

function buildSlots(step: number): TimePickerValues[] {
  const minutes = step > 0 ? step : 15;
  const slots: TimePickerValues[] = [];
  for (let cursor = 0; cursor < 24 * 60; cursor += minutes) {
    slots.push(`${pad2(Math.floor(cursor / 60))}:${pad2(cursor % 60)}`);
  }
  return slots;
}

function TimePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  step = 15,
  after,
  invalid,
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
}: TimePickerProps) {
  const startedControlled = React.useRef(valueProp !== undefined);
  const isControlled = startedControlled.current || valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? valueProp : uncontrolled;
  const setValue = React.useCallback(
    (next: TimePickerValues | undefined) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const optionRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  React.useEffect(() => {
    if (!focused) {
      setDraft(value ?? "");
    }
  }, [value, focused]);

  const slots = React.useMemo(() => buildSlots(step), [step]);
  const afterViolation = Boolean(after && value && !isStrictlyAfter(value, after));
  const isInvalid = Boolean(invalid ?? ariaInvalid) || afterViolation;
  const displayValue = focused ? draft : value ? formatClockLabel(value) : draft;

  const canCommit = (parsed: TimePickerValues) => !after || isStrictlyAfter(parsed, after);

  const commitDraft = React.useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        setValue(undefined);
        setDraft("");
        return;
      }
      const parsed = parseTypedTime(trimmed);
      if (!parsed || !canCommit(parsed)) {
        setDraft(value ?? "");
        return;
      }
      setValue(parsed);
      setDraft(parsed);
    },
    [after, setValue, value],
  );

  const tryCommitLive = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      setValue(undefined);
      return;
    }
    const parsed = parseTypedTime(raw);
    if (parsed && canCommit(parsed)) {
      setValue(parsed);
    }
  };

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const selected = value
      ? slots.indexOf(value)
      : slots.findIndex((slot) => !after || isStrictlyAfter(slot, after));
    const nextIndex = selected >= 0 ? selected : 0;
    setActiveIndex(nextIndex);
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
      listRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [after, open, slots, value]);

  const selectSlot = (slot: TimePickerValues) => {
    if (!canCommit(slot)) {
      return;
    }
    setValue(slot);
    setDraft(slot);
    setOpen(false);
  };

  const activateIndex = (next: number) => {
    setActiveIndex(next);
    optionRefs.current[next]?.scrollIntoView({ block: "nearest" });
  };

  const firstEnabledIndex = () => slots.findIndex((slot) => canCommit(slot));
  const lastEnabledIndex = () => {
    for (let index = slots.length - 1; index >= 0; index -= 1) {
      const slot = slots[index];
      if (slot && canCommit(slot)) {
        return index;
      }
    }
    return -1;
  };

  const moveActive = (delta: number) => {
    if (slots.length === 0) {
      return;
    }
    let next = activeIndex;
    for (let attempt = 0; attempt < slots.length; attempt += 1) {
      next = (next + delta + slots.length) % slots.length;
      const candidate = slots[next];
      if (candidate && canCommit(candidate)) {
        activateIndex(next);
        return;
      }
    }
  };

  return (
    <InputGroup
      className={cn(className)}
      data-slot="time-picker"
      data-disabled={disabled || undefined}
    >
      <InputGroupInput
        {...inputProps}
        id={id}
        name={name}
        autoComplete="off"
        inputMode="numeric"
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
            aria-label="Clear time"
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
          <InputGroupButton
            type="button"
            variant="ghost"
            disabled={disabled || readOnly}
            aria-label="Open time list"
            render={<PopoverTrigger />}
          >
            <ClockIcon />
          </InputGroupButton>
          <PopoverContent align="start" className="w-44 p-1">
            <PopoverTitle className="sr-only">Choose time</PopoverTitle>
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={0}
              aria-label="Available times"
              aria-activedescendant={
                slots[activeIndex] ? `${listId}-${slots[activeIndex]}` : undefined
              }
              className="max-h-64 overflow-y-auto outline-none"
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  moveActive(1);
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  moveActive(-1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  const next = firstEnabledIndex();
                  if (next >= 0) {
                    activateIndex(next);
                  }
                } else if (event.key === "End") {
                  event.preventDefault();
                  const next = lastEnabledIndex();
                  if (next >= 0) {
                    activateIndex(next);
                  }
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const slot = slots[activeIndex];
                  if (slot) {
                    selectSlot(slot);
                  }
                }
              }}
            >
              {slots.map((slot, index) => {
                const blocked = Boolean(after && !isStrictlyAfter(slot, after));
                return (
                  <button
                    key={slot}
                    id={`${listId}-${slot}`}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={value === slot}
                    aria-disabled={blocked || undefined}
                    disabled={blocked}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                      value === slot && "bg-primary text-primary-foreground",
                      index === activeIndex && value !== slot && "bg-muted",
                      blocked && "opacity-50",
                    )}
                    onClick={() => selectSlot(slot)}
                  >
                    <span>{formatClockLabel(slot)}</span>
                    <span className="text-xs opacity-70">{slot}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}

export {
  type TimePickerProps,
  type TimePickerValues,
  timePickerSchema,
} from "./TimePicker.schema";
export { TimePicker };
