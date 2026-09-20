"use client";

import { type PortalToastId, type PortalToastTone, portalToastCopy } from "@balanse/domain";
import { toast } from "@/components/jabkit/toast";

/**
 * The single entry point for portal toasts (FE-SHR-006). Screens call this
 * instead of importing the vendored Jabkit module so the tone vocabulary, the
 * live-region priority, and the dismiss timings stay in one place.
 */

export type NotifyInput = {
  title: string;
  description?: string;
  /** Pass a stable id to replace an in-flight toast instead of stacking one. */
  id?: string;
  /** Milliseconds before auto-dismiss. `0` keeps the toast until dismissed. */
  timeout?: number;
};

/** Loading toasts stay until the caller resolves them. */
const NEVER_DISMISS = 0;

function add(tone: PortalToastTone, input: NotifyInput): string {
  return toast.add({
    type: tone,
    title: input.title,
    description: input.description,
    id: input.id,
    timeout: input.timeout ?? (tone === "loading" ? NEVER_DISMISS : undefined),
    priority: tone === "error" ? "high" : "low",
  });
}

export const notify = {
  success: (input: NotifyInput) => add("success", input),
  info: (input: NotifyInput) => add("info", input),
  warning: (input: NotifyInput) => add("warning", input),
  error: (input: NotifyInput) => add("error", input),
  loading: (input: NotifyInput) => add("loading", input),

  /** Raises one of the reviewed `@balanse/domain` portal messages. */
  portal: (id: PortalToastId, overrides?: Pick<NotifyInput, "id" | "timeout">) => {
    const copy = portalToastCopy(id);
    return add(copy.tone, {
      title: copy.title,
      description: copy.description,
      ...overrides,
    });
  },

  dismiss: (toastId?: string) => toast.close(toastId),
};
