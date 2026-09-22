"use client";

import {
  groupedPermissionRegistry,
  isSensitivePermission,
  PERMISSION_CATEGORY_LABELS,
  type PermissionCategory,
  type PermissionKey,
} from "@balanse/domain";
import { Button } from "@balanse/ui";
import type { FormFieldRenderProps } from "@/modules/admin/forms/admin-form/AdminForm.schema";
import { CheckboxGroupBinding } from "@/modules/admin/forms/bindings";

export type RolePermissionChecklistProps = {
  value: readonly PermissionKey[];
  onChange: (next: PermissionKey[]) => void;
  onBlur: () => void;
  name: string;
  ref?: FormFieldRenderProps["ref"];
  disabled?: boolean;
};

export function RolePermissionChecklist({
  value,
  onChange,
  onBlur,
  name,
  ref,
  disabled,
}: RolePermissionChecklistProps) {
  const grouped = groupedPermissionRegistry();
  const selected = new Set(value);

  function setGroup(category: PermissionCategory, checked: boolean) {
    const keys = grouped[category].map((item) => item.key);
    const next = new Set(selected);
    for (const key of keys) {
      if (checked) next.add(key);
      else next.delete(key);
    }
    onChange([...next]);
  }

  return (
    <div className="space-y-6">
      {(Object.keys(grouped) as PermissionCategory[]).map((category) => {
        const items = grouped[category];
        const groupKeys = items.map((item) => item.key);
        const selectedInGroup = groupKeys.filter((key) => selected.has(key)).length;
        return (
          <section key={category} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                {PERMISSION_CATEGORY_LABELS[category]}
                <span className="ml-2 font-normal text-muted-foreground">
                  {selectedInGroup}/{items.length}
                </span>
              </h3>
              {disabled ? null : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setGroup(category, true)}
                  >
                    Select group
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setGroup(category, false)}
                  >
                    Clear group
                  </Button>
                </div>
              )}
            </div>
            <CheckboxGroupBinding
              name={`${name}-${category}`}
              value={[...selected]}
              onChange={(next) => onChange(next as PermissionKey[])}
              onBlur={onBlur}
              ref={ref ?? (() => undefined)}
              disabled={disabled}
              options={items.map((item) => ({
                value: item.key,
                label: item.label,
                description: isSensitivePermission(item.key)
                  ? `${item.description} Sensitive: this exposes privileged data.`
                  : item.description,
              }))}
            />
          </section>
        );
      })}
    </div>
  );
}
