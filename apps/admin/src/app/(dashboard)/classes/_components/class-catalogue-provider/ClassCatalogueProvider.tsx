"use client";
import type { PublicClass, PublicCoach } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type ClassCatalogueData = {
  classes: PublicClass[];
  coaches: PublicCoach[];
  canSave: boolean;
};
export type ClassCataloguePort = {
  disconnect?: () => Promise<void>;
  initialData: ClassCatalogueData;
  load: () => Promise<ClassCatalogueData>;
  save: (input: Omit<PublicClass, "id"> & { id?: string }) => Promise<PublicClass>;
  connect: (input: { email: string; password: string }) => Promise<{ error?: string }>;
};
export type ClassCatalogueProviderProps = ClassCataloguePort & { children: ReactNode };

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
