import "server-only";
import { readClassCatalogue } from "@balanse/api/class-catalogue";
import { connection } from "next/server";
import { cache } from "react";

/** Live class catalogue (WIRE-0507, #358 — the mock fallback is retired). */
export const getClassCatalogue = cache(async () => {
  // Render per request: the catalogue is live data (uncached fetch). Without
  // this, `next build` tries to prerender /classes, and the Supabase client
  // turns Next's dynamic-rendering bailout into a query error.
  await connection();
  return readClassCatalogue();
});
