import type { PublicClass, PublicCoach } from "@balanse/domain";
import type { ReactNode } from "react";
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
