"use client";

import type { StaffAuthorizationActor } from "@balanse/domain";
import {
  DEFAULT_MOCK_PRINCIPAL,
  isMockHarnessEnabled,
  MOCK_HARNESS_COOKIE,
  type MockPrincipal,
  normalizeMockPrincipal,
  parseMockPrincipal,
  resolveMockStaffActor,
  serializeMockPrincipal,
} from "@balanse/mock/session";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { bindAdminQueryPrincipal } from "@/lib/query/auth-scope";

const SessionContext = createContext<{
  principal: MockPrincipal;
  actor: StaffAuthorizationActor | null;
  setPrincipal: (next: Partial<MockPrincipal>) => MockPrincipal;
  harnessEnabled: boolean;
} | null>(null);

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${MOCK_HARNESS_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(principal: MockPrincipal) {
  // Mock harness only (WIRE-002). Cookie Store API is not required here.
  // biome-ignore lint/suspicious/noDocumentCookie: persisted mock principal for middleware/guards
  document.cookie = `${MOCK_HARNESS_COOKIE}=${encodeURIComponent(serializeMockPrincipal(principal))}; path=/; max-age=2592000; samesite=lax`;
}

export function MockSessionProvider({
  children,
  initialPrincipal,
}: {
  children: ReactNode;
  initialPrincipal?: MockPrincipal;
}) {
  const [principal, setPrincipalState] = useState<MockPrincipal>(() => {
    const resolved = initialPrincipal ?? parseMockPrincipal(readCookie()) ?? DEFAULT_MOCK_PRINCIPAL;
    const normalized = normalizeMockPrincipal(resolved);
    bindAdminQueryPrincipal(normalized);
    return normalized;
  });

  const setPrincipal = useCallback((next: Partial<MockPrincipal>) => {
    let merged = normalizeMockPrincipal(next);
    setPrincipalState((current) => {
      merged = normalizeMockPrincipal({ ...current, ...next });
      writeCookie(merged);
      bindAdminQueryPrincipal(merged);
      return merged;
    });
    return merged;
  }, []);

  const actor = useMemo(() => resolveMockStaffActor(principal), [principal]);

  const value = useMemo(
    () => ({ principal, actor, setPrincipal, harnessEnabled: isMockHarnessEnabled() }),
    [principal, actor, setPrincipal],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useMockPrincipal() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useMockPrincipal must be used inside MockSessionProvider");
  }
  return ctx;
}
