import { Check } from "lucide-react";

export type PaymentStep<Id extends string = string> = { id: Id; label: string };

export function PaymentStepper<Id extends string>({
  steps,
  current,
}: {
  steps: readonly PaymentStep<Id>[];
  current: Id;
}) {
  const index = steps.findIndex((item) => item.id === current);
  return (
    <ol
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      aria-label="Payment steps"
    >
      {steps.map((item, position) => {
        const state = position < index ? "done" : position === index ? "current" : "upcoming";
        return (
          <li
            key={item.id}
            aria-current={state === "current" ? "step" : undefined}
            data-state={state}
            className="group grid gap-2"
          >
            <span className="h-1 rounded-full bg-border group-data-[state=current]:bg-primary group-data-[state=done]:bg-primary/60" />
            <span className="flex items-center gap-2 text-xs font-semibold">
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-[0.65rem] group-data-[state=current]:border-primary group-data-[state=current]:bg-primary group-data-[state=current]:text-primary-foreground group-data-[state=done]:border-primary/60 group-data-[state=done]:bg-primary/60 group-data-[state=done]:text-primary-foreground">
                {state === "done" ? <Check aria-hidden className="size-3" /> : position + 1}
              </span>
              <span className="hidden text-muted-foreground group-data-[state=current]:text-foreground sm:inline">
                {item.label}
              </span>
              <span className="sr-only sm:hidden">{item.label}</span>
              {state === "done" ? <span className="sr-only">(done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
