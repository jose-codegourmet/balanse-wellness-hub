import { BALANSE_BREAKPOINT_LABELS } from "@balanse/config";
import { formatPeso } from "@balanse/domain";

const tokens = [
  "cream",
  "warm-white",
  "beige",
  "tan",
  "muted-brown",
  "navy",
  "charcoal",
  "gold",
] as const;

export default function TokensPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl">Balansé tokens</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tokens.map((name) => (
          <div key={name}>
            <div
              className="h-16 rounded-md border border-border"
              style={{ background: `var(--balanse-${name})` }}
            />
            <p className="mt-2 text-sm">{name}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm">{Object.values(BALANSE_BREAKPOINT_LABELS).join(" · ")}</p>
      <p className="mt-2">{formatPeso(1000)}</p>
    </main>
  );
}
