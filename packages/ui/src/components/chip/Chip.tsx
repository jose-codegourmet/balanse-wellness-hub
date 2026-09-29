import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";
import type { ChipProps } from "./Chip.schema";

/**
 * Choice chip: time slots, weekday pickers, filters, presets. Sentence case,
 * 6px corners like Button, navy when selected. Use Button for actions.
 *
 * `chipVariants` also styles `<label>`s that wrap a native radio or checkbox
 * (give the input `className="sr-only"`); the label is `relative` so the hidden
 * input never scrolls its container.
 */
const chipVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border font-sans font-medium whitespace-nowrap tabular-nums select-none",
    "transition-[background-color,border-color,color] duration-150 ease-out outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45 has-disabled:pointer-events-none has-disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ].join(" "),
  {
    variants: {
      selected: {
        true: "border-primary bg-primary text-primary-foreground",
        false: "border-border bg-background text-foreground hover:border-foreground/50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-3.5 text-sm",
        /** Square, for single letters or numbers (weekday initials, day-of-month). */
        square: "size-9 text-xs",
      },
    },
    defaultVariants: { selected: false, size: "md" },
  },
);

function Chip({ selected = false, size = "md", className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      data-slot="chip"
      aria-pressed={selected}
      className={cn(chipVariants({ selected, size }), className)}
      {...props}
    />
  );
}

export type { ChipProps } from "./Chip.schema";
export { Chip, chipVariants };
