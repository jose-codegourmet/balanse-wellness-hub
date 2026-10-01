"use client";

import { Switch } from "@balanse/ui";
import { ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { notify } from "@/modules/notifications/notify";
import type { RosterVisibilitySettingProps } from "./RosterVisibilitySetting.meta";

export function RosterVisibilitySetting({
  checked: savedChecked,
  onChange,
  disabled = false,
}: RosterVisibilitySettingProps) {
  const id = useId();
  const [checked, setChecked] = useState(savedChecked);
  const [pending, setPending] = useState(false);

  async function toggle(next: boolean) {
    const previous = checked;
    setChecked(next);
    setPending(true);
    const failure = await onChange(next);
    setPending(false);
    if (failure) {
      setChecked(previous);
      notify.error({ title: "Roster setting not saved", description: failure });
      return;
    }
    notify.success({
      title: next ? "You're shown on class rosters" : "You're hidden from class rosters",
      description: next
        ? "Other members can see your name and photo on classes you join."
        : "You're still counted as going.",
    });
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mt-8 border-t border-border pt-6">
      <div className="profile-section-title">
        <ShieldCheck size={19} strokeWidth={1.5} aria-hidden="true" />
        <h3 id={`${id}-title`} className="font-display text-lg">
          Privacy
        </h3>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <label htmlFor={`${id}-switch`} className="text-sm font-medium">
            Show me on class rosters
          </label>
          <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">
            When off, you’re counted as going but your name and photo are hidden from other members.
            Coaches and studio staff can still see you.
          </p>
        </div>
        <Switch
          id={`${id}-switch`}
          checked={checked}
          disabled={disabled || pending}
          aria-describedby={`${id}-description`}
          onCheckedChange={(next) => void toggle(next)}
        />
      </div>
    </section>
  );
}
