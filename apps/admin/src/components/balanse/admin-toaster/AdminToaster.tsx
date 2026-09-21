"use client";

import { Toaster } from "@/components/jabkit/toast";
import type { AdminToasterProps } from "./AdminToaster.meta";
import "./toast.css";

/** Longer than the Jabkit default so a confirmation survives a page transition. */
const ADMIN_TOAST_TIMEOUT_MS = 6000;

/**
 * The admin app's single toast surface (FE-ADM-019).
 *
 * Mirrors the portal `BalanseToaster`: Jabkit Base-UI, not Sonner. Mounted
 * once in `modules/providers/Providers`. The vendored viewport is
 * `position: fixed` at the bottom of the viewport.
 */
export function AdminToaster({ disablePortal }: AdminToasterProps) {
  return (
    <Toaster
      limit={3}
      timeout={ADMIN_TOAST_TIMEOUT_MS}
      disablePortal={disablePortal}
      viewportClassName="admin-toaster"
    />
  );
}
