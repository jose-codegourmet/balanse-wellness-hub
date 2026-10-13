"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { BalanseToaster } from "@/components/balanse/portal/BalanseToaster";
import { makeQueryClient } from "@/lib/query/client";
import { type ClientSession, SessionProvider } from "@/modules/session/SessionProvider";

export function Providers({ children, session }: { children: ReactNode; session: ClientSession }) {
  const [queryClient] = useState(() => makeQueryClient());
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <BalanseToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
