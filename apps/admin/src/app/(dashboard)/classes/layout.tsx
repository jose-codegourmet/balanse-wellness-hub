import {
  connectClassAdmin,
  disconnectClassAdmin,
  loadClassCatalogue,
  saveClassCatalogue,
} from "@/lib/class-catalogue-actions";
import { ClassCatalogueProvider } from "./_components/class-catalogue-provider/ClassCatalogueProvider";
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_CLASS_CATALOGUE_MODE !== "database") return children;
  return (
    <ClassCatalogueProvider
      initialData={await loadClassCatalogue()}
      load={loadClassCatalogue}
      save={saveClassCatalogue}
      connect={connectClassAdmin}
      disconnect={disconnectClassAdmin}
    >
      {children}
    </ClassCatalogueProvider>
  );
}
