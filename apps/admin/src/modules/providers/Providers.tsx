"use client";

import type { MockPrincipal } from "@balanse/mock/session";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { AdminToaster } from "@/components/balanse/admin-toaster/AdminToaster";
import { makeQueryClient } from "@/lib/query/client";
import { MockSessionHarness } from "@/modules/dev-harness/MockSessionHarness";
import { MockSessionProvider } from "@/modules/session/MockSessionProvider";

export function Providers({
  children,
  initialPrincipal,
  queryClient: injectedClient,
}: {
  children: ReactNode;
  initialPrincipal?: MockPrincipal;
  queryClient?: QueryClient;
}) {
  const [queryClient] = useState(() => injectedClient ?? makeQueryClient());
  return (
    <MockSessionProvider initialPrincipal={initialPrincipal}>
      <QueryClientProvider client={queryClient}>
        {process.env.NODE_ENV !== "production" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
        >
          <MockSessionHarness />
          {children}
          <AdminToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </MockSessionProvider>
  );
}
