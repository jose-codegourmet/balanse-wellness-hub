"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { BalanseToaster } from "@/components/balanse/portal/BalanseToaster";
import { MockSessionHarness } from "@/modules/dev-harness/MockSessionHarness";
import { type ClientSession, SessionProvider } from "@/modules/session/SessionProvider";

export function Providers({ children, session }: { children: ReactNode; session: ClientSession }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <MockSessionHarness />
          {children}
          <BalanseToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
