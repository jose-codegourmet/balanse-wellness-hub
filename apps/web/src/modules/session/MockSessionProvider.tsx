"use client";

import {
  DEFAULT_MOCK_PRINCIPAL,
  isMockHarnessEnabled,
  MOCK_HARNESS_COOKIE,
  type MockPrincipal,
  normalizeMockPrincipal,
  parseMockPrincipal,
  serializeMockPrincipal,
} from "@balanse/mock/session";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

const SessionContext = createContext<{
  principal: MockPrincipal;
  setPrincipal: (next: Partial<MockPrincipal>) => void;
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
  const [principal, setPrincipalState] = useState<MockPrincipal>(() =>
    normalizeMockPrincipal(
      initialPrincipal ?? parseMockPrincipal(readCookie()) ?? DEFAULT_MOCK_PRINCIPAL,
    ),
  );

  const setPrincipal = useCallback((next: Partial<MockPrincipal>) => {
    setPrincipalState((current) => {
      const merged = normalizeMockPrincipal({ ...current, ...next });
      writeCookie(merged);
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({ principal, setPrincipal, harnessEnabled: isMockHarnessEnabled() }),
    [principal, setPrincipal],
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
