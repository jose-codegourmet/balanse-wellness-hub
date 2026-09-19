import { BALANSE_BREAKPOINT_LABELS } from "@balanse/config";
import { formatPeso, formatSessionRange } from "@balanse/domain";

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
      <p className="mt-2 text-sm text-muted-foreground">
        Palette from findings.md §5. Logo file is not in-repo — the text lockup is a flagged
        placeholder.
      </p>
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
      <h2 className="mt-10 font-display text-2xl">Type scale</h2>
      <p className="text-sm">Body</p>
      <p className="font-display text-3xl">Display</p>
      <h2 className="mt-10 font-display text-2xl">Spacing</h2>
      <div className="flex items-end gap-2">
        <div className="h-4 w-4 bg-primary" />
        <div className="h-6 w-6 bg-primary" />
        <div className="h-8 w-8 bg-primary" />
      </div>
      <h2 className="mt-10 font-display text-2xl">Breakpoints</h2>
      <ul className="list-disc pl-6 text-sm">
        {Object.values(BALANSE_BREAKPOINT_LABELS).map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl">Formatters</h2>
      <p>{formatPeso(1000)}</p>
      <p>{formatSessionRange("2026-09-16T00:00:00.000Z", "2026-09-16T01:30:00.000Z")}</p>
    </main>
  );
}
