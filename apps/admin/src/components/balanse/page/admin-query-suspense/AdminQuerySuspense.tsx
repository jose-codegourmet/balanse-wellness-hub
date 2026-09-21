import { type ReactNode, Suspense } from "react";

/** Client reads use `useSuspenseQuery`. This is the nearest boundary (not `lib/query`). */
export function AdminQuerySuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
