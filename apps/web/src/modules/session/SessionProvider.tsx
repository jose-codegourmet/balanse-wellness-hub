"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

/**
 * Client view of the Supabase session. The root layout reads the verified
 * claims on the server and passes them down, so `router.refresh()` after
 * login or logout updates every consumer. Never an authorization source:
 * routes and server actions re-check the session on the server.
 */
export type ClientSession = { customerId: string; email: string } | null;

const SessionContext = createContext<ClientSession>(null);

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: ClientSession;
}) {
  const customerId = session?.customerId;
  const email = session?.email;
  const value = useMemo(
    () => (customerId ? { customerId, email: email ?? "" } : null),
    [customerId, email],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): ClientSession {
  return useContext(SessionContext);
}
