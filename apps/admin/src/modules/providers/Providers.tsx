"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { AdminToaster } from "@/components/balanse/admin-toaster/AdminToaster";
import { makeQueryClient } from "@/lib/query/client";
import {
  type ClientStaffSession,
  DEFAULT_STAFF_SESSION,
  SessionProvider,
} from "@/modules/session/SessionProvider";

export function Providers({
  children,
  session = DEFAULT_STAFF_SESSION,
  queryClient: injectedClient,
}: {
  children: ReactNode;
  session?: ClientStaffSession;
  queryClient?: QueryClient;
}) {
  const [queryClient] = useState(() => injectedClient ?? makeQueryClient());
  return (
    <SessionProvider session={session}>
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
          {children}
          <AdminToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
