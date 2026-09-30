"use client";

import { Button } from "@balanse/ui";
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from "lucide-react";
import { useState } from "react";
import type { FormFieldRenderProps } from "@/modules/admin/forms/admin-form/AdminForm.schema";

export type SortablePolicyOption = { value: string; label: string; description?: string };

export type SortablePolicyListProps = FormFieldRenderProps & {
  options: SortablePolicyOption[];
  /** Used in button labels, e.g. "Sign up". */
  formLabel: string;
};

function moved(list: string[], from: number, to: number): string[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

/**
 * Ordered list of attached policies for one customer form. Drag a row by its
 * handle, or use Move up / Move down on touch and keyboard. Customers see the
 * policies in this order.
 */
export function SortablePolicyList({
  value,
  onChange,
  onBlur,
  name,
  options,
  formLabel,
}: SortablePolicyListProps) {
  const attached = Array.isArray(value) ? (value as string[]) : [];
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const byValue = new Map(options.map((option) => [option.value, option]));
  const available = options.filter((option) => !attached.includes(option.value));

  function commit(next: string[]) {
    onChange(next);
    onBlur();
  }

  function endDrag() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="grid gap-3" data-field={name}>
      {attached.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          No policies on this form. Customers submit it without accepting anything.
        </p>
      ) : (
        <ol className="grid gap-2" aria-label={`Policy order on ${formLabel}`}>
          {attached.map((policyName, index) => {
            const option = byValue.get(policyName);
            const dropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;
            return (
              <li
                key={policyName}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", policyName);
                  setDragIndex(index);
                }}
                onDragOver={(event) => {
                  if (dragIndex === null) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setOverIndex(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null && dragIndex !== index)
                    commit(moved(attached, dragIndex, index));
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={[
                  "flex flex-wrap items-center gap-3 rounded-lg border bg-background p-3 transition",
                  dragIndex === index ? "opacity-50" : "",
                  dropTarget ? "border-primary ring-2 ring-primary/30" : "border-border",
                ].join(" ")}
              >
                <GripVertical
                  className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                  aria-hidden
                />
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{option?.label ?? policyName}</span>
                  {option?.description ? (
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <span className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => commit(moved(attached, index, index - 1))}
                    aria-label={`Move ${policyName} up on ${formLabel}`}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === attached.length - 1}
                    onClick={() => commit(moved(attached, index, index + 1))}
                    aria-label={`Move ${policyName} down on ${formLabel}`}
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => commit(attached.filter((item) => item !== policyName))}
                    aria-label={`Remove ${policyName} from ${formLabel}`}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {available.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Add
          </span>
          {available.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => commit([...attached, option.value])}
              aria-label={`Add ${option.label} to ${formLabel}`}
            >
              <Plus className="size-4" aria-hidden />
              {option.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
