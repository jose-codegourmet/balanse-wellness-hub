import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export default function KitPage() {
  const dir = join(process.cwd(), "src/components/jabkit");
  const names = existsSync(dir)
    ? readdirSync(dir).filter((name) => !name.startsWith(".") && name !== "lib")
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl">Jabkit inventory</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vendored files live in <code>src/components/jabkit</code>. Wrap them from{" "}
        <code>src/components/balanse</code> instead of editing them.
      </p>
      {names.length === 0 ? (
        <p className="mt-6">No Jabkit components installed yet. Run the add script in this app.</p>
      ) : (
        <ul className="mt-6 columns-2 gap-4 text-sm md:columns-3">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
