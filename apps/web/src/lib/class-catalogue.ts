import "server-only";
import { readClassCatalogue } from "@balanse/api/class-catalogue";
import { getMockAdapter } from "@balanse/mock";
import { connection } from "next/server";
import { cache } from "react";

export const getClassCatalogue = cache(async () => {
  if (process.env.NEXT_PUBLIC_CLASS_CATALOGUE_MODE === "database") {
    // Render per request: the catalogue is live data (uncached fetch). Without
    // this, `next build` tries to prerender /classes, and the Supabase client
    // turns Next's dynamic-rendering bailout into a query error.
    await connection();
    return readClassCatalogue();
  }
  const adapter = getMockAdapter();
  return { classes: await adapter.getPublicClasses(), coaches: await adapter.getPublicCoaches() };
});
