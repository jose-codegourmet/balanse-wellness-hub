"use client";

import { FIELD_CONSTRAINTS } from "@balanse/domain";
import { Badge, Button, Input, useFieldContext } from "@balanse/ui";
import { X } from "lucide-react";
import { useState } from "react";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

export type TagListBindingProps = FormFieldRenderProps & {
  placeholder?: string;
  maxItems?: number;
  itemMax?: number;
};

/** Free-text chip list. Enter or comma commits a tag — the value is `string[]`. */
export function TagListBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  placeholder = "Add a specialty",
  maxItems = FIELD_CONSTRAINTS.coach.specialties.maxItems,
  itemMax = FIELD_CONSTRAINTS.coach.specialties.itemMax,
}: TagListBindingProps) {
  const field = useFieldContext();
  const tags = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const next = raw.trim();
    if (!next || tags.includes(next) || tags.length >= maxItems) return;
    onChange([...tags, next.slice(0, itemMax)]);
    setDraft("");
  }

  function remove(tag: string) {
    onChange(tags.filter((item) => item !== tag));
  }

  return (
    <div
      className="grid gap-2"
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    >
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="neutral" appearance="soft" size="sm">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
            >
              <X />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        ref={ref}
        id={field?.id}
        name={name}
        value={draft}
        maxLength={itemMax}
        placeholder={placeholder}
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        onBlur={() => {
          if (draft.trim()) commit(draft);
          onBlur();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(draft);
          }
          if (event.key === "Backspace" && draft.length === 0) {
            const last = tags.at(-1);
            if (last) remove(last);
          }
        }}
      />
    </div>
  );
}
