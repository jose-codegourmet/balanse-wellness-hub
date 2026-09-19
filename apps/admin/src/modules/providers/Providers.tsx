"use client";

import type { MockPrincipal } from "@balanse/mock/session";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { MockSessionHarness } from "@/modules/dev-harness/MockSessionHarness";
import { MockSessionProvider } from "@/modules/session/MockSessionProvider";

export function Providers({
  children,
  initialPrincipal,
}: {
  children: ReactNode;
  initialPrincipal?: MockPrincipal;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <MockSessionProvider initialPrincipal={initialPrincipal}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <MockSessionHarness />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </MockSessionProvider>
  );
}
