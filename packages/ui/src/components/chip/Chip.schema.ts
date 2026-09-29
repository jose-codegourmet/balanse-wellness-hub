import type { VariantProps } from "class-variance-authority";
import type { chipVariants } from "./Chip";

export type ChipVariantProps = VariantProps<typeof chipVariants>;

export type ChipProps = Omit<React.ComponentProps<"button">, "type"> &
  Omit<ChipVariantProps, "selected"> & {
    /** On/off state. Rendered as `aria-pressed`. */
    selected?: boolean;
  };
