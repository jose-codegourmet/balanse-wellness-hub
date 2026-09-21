"use client";

import { maskPhMobileInput, PH_MOBILE_PLACEHOLDER } from "@balanse/domain";
import { type ChangeEvent, useState } from "react";

import { Input } from "../input/Input";

import type { PhPhoneInputProps } from "./PhPhoneInput.schema";

function countDigits(value: string, end: number): number {
  let count = 0;
  const limit = Math.min(end, value.length);
  for (let i = 0; i < limit; i++) {
    if (value[i] >= "0" && value[i] <= "9") count += 1;
  }
  return count;
}

function indexAfterDigits(value: string, digits: number): number {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] >= "0" && value[i] <= "9") {
      seen += 1;
      if (seen >= digits) return i + 1;
    }
  }
  return value.length;
}

function PhPhoneInput({
  value,
  defaultValue,
  onChange,
  placeholder = PH_MOBILE_PLACEHOLDER,
  ...props
}: PhPhoneInputProps) {
  const controlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() =>
    maskPhMobileInput(defaultValue == null ? "" : String(defaultValue)),
  );
  const display = maskPhMobileInput(controlled ? String(value ?? "") : uncontrolled);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    const raw = el.value;
    const cursor = el.selectionStart ?? raw.length;
    const digitsBefore = countDigits(raw, cursor);
    const next = maskPhMobileInput(raw);
    el.value = next;
    if (!controlled) setUncontrolled(next);
    const nextCursor = indexAfterDigits(next, digitsBefore);
    requestAnimationFrame(() => {
      el.setSelectionRange(nextCursor, nextCursor);
    });
    onChange?.(event);
  };

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete={props.autoComplete ?? "tel"}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
    />
  );
}

export type { PhPhoneInputProps } from "./PhPhoneInput.schema";
export { PhPhoneInput };
