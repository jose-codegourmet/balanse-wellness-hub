"use client";
import { getMockAdapter } from "@balanse/mock";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type {
  ClassCataloguePort,
  ClassCatalogueProviderProps,
} from "./ClassCatalogueProvider.schema";

const Context = createContext<ClassCataloguePort | null>(null);
export function ClassCatalogueProvider({ children, ...port }: ClassCatalogueProviderProps) {
  return <Context.Provider value={port}>{children}</Context.Provider>;
}
export function useClassCatalogue() {
  const port = useContext(Context);
  const client = useQueryClient();
  const query = queryOptions({
    queryKey: ["class-catalogue", port ? "database" : "mock"],
    queryFn:
      port?.load ??
      (async () => ({
        classes: await getMockAdapter().getAdminClasses(),
        coaches: await getMockAdapter().getPublicCoaches(),
        canSave: true,
      })),
    ...(port ? { initialData: port.initialData } : {}),
  });
  const mutation = useMutation({
    mutationFn: port?.save ?? getMockAdapter().upsertAdminClass,
    onSuccess: () => client.invalidateQueries({ queryKey: query.queryKey }),
  });
  return { query, mutation, live: !!port, disconnect: port?.disconnect, connect: port?.connect };
}
