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
      <ul className="mt-6 columns-2 text-sm">
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </main>
  );
}
