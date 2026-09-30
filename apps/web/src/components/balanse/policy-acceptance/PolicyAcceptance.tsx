"use client";

import { type PolicyDocumentVersion, policyAcceptanceKey } from "@balanse/domain";
import { renderMarkdownSubset } from "@balanse/ui";
import { useId, useState } from "react";

export type PolicyAcceptanceProps = {
  policies: PolicyDocumentVersion[];
  accepted: Record<string, boolean>;
  onAcceptedChange: (key: string, checked: boolean) => void;
  showError?: boolean;
  title?: string;
  /** `inverse` sits on the dark primary surface (package hero). */
  tone?: "default" | "inverse";
  className?: string;
  id?: string;
};

/** Pairs with `PolicyAcceptance`: owns the checkbox state and the submit gate. */
export function usePolicyAcceptance(policies: PolicyDocumentVersion[]) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const allAccepted = policies.every((doc) => accepted[policyAcceptanceKey(doc)]);
  return {
    allAccepted,
    /** True when every attached policy is accepted; otherwise reveals the error. */
    check: () => {
      setAttempted(true);
      return allAccepted;
    },
    props: {
      policies,
      accepted,
      showError: attempted && !allAccepted,
      onAcceptedChange: (key: string, checked: boolean) =>
        setAccepted((current) => ({ ...current, [key]: checked })),
    },
  };
}

export function PolicyAcceptance({
  policies,
  accepted,
  onAcceptedChange,
  showError = false,
  title = "Policies to accept",
  tone = "default",
  className,
  id,
}: PolicyAcceptanceProps) {
  const errorId = useId();
  if (policies.length === 0) return null;
  const inverse = tone === "inverse";
  const muted = inverse ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <fieldset
      id={id}
      data-slot="policy-acceptance"
      aria-describedby={showError ? errorId : undefined}
      className={["grid gap-3", className].filter(Boolean).join(" ")}
    >
      <legend className={`mb-3 text-sm font-semibold ${inverse ? "" : "text-foreground"}`}>
        {title}
      </legend>
      {policies.map((doc) => {
        const key = policyAcceptanceKey(doc);
        const body = renderMarkdownSubset(doc.body);
        return (
          <div
            key={key}
            className={
              inverse
                ? "rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 p-4 text-sm"
                : "rounded-xl border border-border bg-card p-4 text-sm"
            }
          >
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0"
                checked={Boolean(accepted[key])}
                aria-invalid={showError && !accepted[key] ? true : undefined}
                onChange={(event) => onAcceptedChange(key, event.target.checked)}
              />
              <span>
                I have read and accept the{" "}
                <span className="font-medium">
                  {doc.documentName} (v{doc.version})
                </span>
                .
              </span>
            </label>
            {body ? (
              <details className="mt-2 pl-7">
                <summary className={`cursor-pointer text-xs font-semibold ${muted}`}>
                  Read {doc.documentName}
                </summary>
                <div className={`mt-2 grid gap-2 text-xs leading-5 ${muted}`}>{body}</div>
              </details>
            ) : null}
          </div>
        );
      })}
      {showError ? (
        <p
          id={errorId}
          role="alert"
          className={`text-sm ${inverse ? "text-primary-foreground" : "text-destructive"}`}
        >
          Accept each policy to continue.
        </p>
      ) : null}
    </fieldset>
  );
}
