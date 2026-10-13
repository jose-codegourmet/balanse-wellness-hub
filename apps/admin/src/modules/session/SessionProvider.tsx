"use client";

import type { StaffAuthorizationActor } from "@balanse/domain";
import { createContext, type ReactNode, useContext, useMemo } from "react";

/**
 * Client view of the admin's staff session (WIRE-0201/0202, #357 —
 * replaces `MockSessionProvider`). The root layout resolves this on the
 * server (`getStaffSession` in `current-staff.ts`) and passes it down;
 * `router.refresh()` after sign-in/sign-out updates every consumer. Never an
 * authorization source on its own — the API re-checks on every request.
 */
export type StaffSessionRole = "guest" | "customer" | "admin";

export type ClientStaffSession = {
  role: StaffSessionRole;
  actor: StaffAuthorizationActor | null;
};

export const DEFAULT_STAFF_SESSION: ClientStaffSession = { role: "guest", actor: null };

const SessionContext = createContext<ClientStaffSession>(DEFAULT_STAFF_SESSION);

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: ClientStaffSession;
}) {
  const role = session.role;
  const actor = session.actor;
  const value = useMemo(() => ({ role, actor }), [role, actor]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useStaffSession(): ClientStaffSession {
  return useContext(SessionContext);
}
