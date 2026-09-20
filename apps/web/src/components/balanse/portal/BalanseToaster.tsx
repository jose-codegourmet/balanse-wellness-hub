"use client";

import { Toaster } from "@/components/jabkit/toast";
import "./toast.css";

/** Longer than the Jabkit default so a confirmation survives a page transition. */
const PORTAL_TOAST_TIMEOUT_MS = 6000;

/**
 * The portal's single toast surface (FE-SHR-006).
 *
 * Mounted once in `modules/providers/Providers`. The vendored viewport is
 * `position: fixed` at the bottom of the viewport, so it never shifts layout
 * and never overlaps the mock harness bar pinned to the top. Toasts are
 * additive: every `FeedbackState` and `LocalizedSkeleton` surface stays put.
 */
export function BalanseToaster({ disablePortal }: { disablePortal?: boolean }) {
  return (
    <Toaster
      limit={3}
      timeout={PORTAL_TOAST_TIMEOUT_MS}
      disablePortal={disablePortal}
      viewportClassName="portal-toaster"
    />
  );
}
