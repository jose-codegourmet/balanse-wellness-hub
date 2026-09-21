"use client";

import type { FieldErrors, FieldValues } from "react-hook-form";
import { useAdminFormContext } from "../admin-form-context/AdminFormContext";

function collectErrors(
  errors: FieldErrors<FieldValues>,
  prefix = "",
): { name: string; message: string }[] {
  const result: { name: string; message: string }[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if ("message" in value && value.message) {
      result.push({ name, message: String(value.message) });
    }
    for (const [childKey, child] of Object.entries(value)) {
      if (["message", "type", "ref", "types"].includes(childKey)) continue;
      if (child && typeof child === "object") {
        result.push(...collectErrors({ [childKey]: child } as FieldErrors<FieldValues>, name));
      }
    }
  }
  return result;
}

export function FormErrorSummary() {
  const { formState, getLabel, getFieldId } = useAdminFormContext();
  if (!formState.isSubmitted) return null;
  const items = collectErrors(formState.errors);
  if (items.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-destructive/40 bg-destructive/5 p-3"
    >
      <p className="text-sm font-medium text-destructive">Fix the following:</p>
      <ul className="mt-1 list-disc pl-5 text-sm text-destructive">
        {items.map((item) => (
          <li key={item.name}>
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => {
                const fieldId = getFieldId(item.name);
                if (fieldId) document.getElementById(fieldId)?.focus();
              }}
            >
              {getLabel(item.name)} — {item.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
