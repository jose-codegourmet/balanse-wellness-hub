import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="min-h-0 flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
