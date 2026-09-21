import { cva, type VariantProps } from "class-variance-authority";

/**
 * Shared control-surface recipe (FE-SHR-016).
 * Resting chrome, size scale, and interactive states for every form control.
 * Tokens only — never hardcoded hex.
 */
export const controlSurfaceBase =
  "w-full min-w-0 rounded-lg border border-input bg-transparent text-base shadow-none transition-colors outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30";

export const controlSurfaceHover = "hover:border-ring/60 dark:hover:bg-input/50";

export const controlSurfaceFocus =
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const controlSurfaceInvalid =
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

export const controlSurfaceDisabled =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80";

export const controlSurfaceReadonly =
  "read-only:cursor-default read-only:bg-muted/50 read-only:text-muted-foreground";

export const controlSizeClass = {
  sm: "h-7 px-2 py-0.5 text-[0.8rem] md:text-xs",
  md: "h-8 px-2.5 py-1",
  lg: "h-9 px-3 py-1.5",
} as const;

export const textareaSizeClass = {
  sm: "min-h-12 px-2 py-1.5 text-[0.8rem] md:text-xs",
  md: "min-h-16 px-2.5 py-2",
  lg: "min-h-20 px-3 py-2.5",
} as const;

export const controlSurfaceVariants = cva(
  [
    controlSurfaceBase,
    controlSurfaceHover,
    controlSurfaceFocus,
    controlSurfaceInvalid,
    controlSurfaceDisabled,
    controlSurfaceReadonly,
  ].join(" "),
  {
    variants: {
      size: controlSizeClass,
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const textareaSurfaceVariants = cva(
  [
    "flex field-sizing-content",
    controlSurfaceBase,
    controlSurfaceHover,
    controlSurfaceFocus,
    controlSurfaceInvalid,
    controlSurfaceDisabled,
    controlSurfaceReadonly,
  ].join(" "),
  {
    variants: {
      size: textareaSizeClass,
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/** InputGroup / ComboboxChips — focus and invalid live on descendants. */
export const controlSurfaceGroup =
  "w-full min-w-0 rounded-lg border border-input bg-transparent shadow-none transition-colors outline-none hover:border-ring/60 dark:bg-input/30 dark:hover:bg-input/50 has-disabled:bg-input/50 has-disabled:opacity-50 dark:has-disabled:bg-input/80 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40";

export const controlSurfaceChips =
  "w-full min-w-0 rounded-lg border border-input bg-transparent shadow-none transition-colors outline-none hover:border-ring/60 dark:bg-input/30 dark:hover:bg-input/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40";

/**
 * Checkbox / Switch / Radio keep their own geometry.
 * Colour, focus, and invalid chrome match the text-control recipe.
 */
export const controlIndicatorStates =
  "border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

export type ControlSurfaceVariantProps = VariantProps<typeof controlSurfaceVariants>;
export type ControlSurfaceSize = NonNullable<ControlSurfaceVariantProps["size"]>;
