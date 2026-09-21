import "server-only";
import { readClassCatalogue } from "@balanse/api/class-catalogue";
import { getMockAdapter } from "@balanse/mock";
import { cache } from "react";

export const getClassCatalogue = cache(async () => {
  if (process.env.NEXT_PUBLIC_CLASS_CATALOGUE_MODE === "database") return readClassCatalogue();
  const adapter = getMockAdapter();
  return { classes: await adapter.getPublicClasses(), coaches: await adapter.getPublicCoaches() };
});
