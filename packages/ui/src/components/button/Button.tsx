import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Spinner } from "../spinner/Spinner";

import type { ButtonProps } from "./Button.schema";

/**
 * Balansé editorial button: crisp 6px corners, uppercase letter-spaced labels,
 * navy / gold / cream surfaces. Labels are uppercased with CSS only, so the
 * accessible name keeps the author's sentence case.
 *
 * Sizes: sm 32px (dense admin rows), md 40px (default), lg 48px (public CTAs).
 * On touch screens md and lg grow to a 44px minimum tap target. `link` ignores
 * size heights and padding so it can sit inline in running text.
 *
 * Navy surfaces (CTA bands, the admin sidebar): add `dark` to the surface (or,
 * for a standalone link, to the element's own class list) so the tokens flip
 * and `outline`, `ghost` and `link` draw in warm white with a gold focus ring.
 * Never recolour a variant with `className`.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] border bg-clip-padding",
    "font-sans font-semibold uppercase whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow] duration-150 ease-out outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Navy. The one main action on a screen. */
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),white_14%)]",
        /** Alias of `default`, for call sites that prefer the explicit name. */
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),white_14%)]",
        /** Gold. Booking and purchase moments on the public site and portal. */
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-[color-mix(in_oklch,var(--accent),var(--balanse-navy)_14%)]",
        /** Tonal cream. Supporting actions that sit beside a primary. */
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)] aria-expanded:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)]",
        /** Hairline navy frame that fills in on hover. Cancel, back, edit. */
        outline:
          "border-foreground/70 bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background aria-expanded:bg-foreground aria-expanded:text-background",
        /** No frame. Toolbars, row actions, dismiss. */
        ghost:
          "border-transparent text-foreground hover:bg-muted aria-expanded:bg-muted dark:hover:bg-muted/60",
        /** Destructive outline that fills red on hover. */
        destructive:
          "border-destructive/60 bg-transparent text-destructive hover:border-destructive hover:bg-destructive hover:text-background focus-visible:ring-destructive/40",
        /** Letter-spaced underline. Inline actions like "Reset to default". */
        link: "h-auto! min-h-0! border-0 px-0! text-foreground underline decoration-1 underline-offset-[5px] hover:decoration-2 hover:text-primary",
      },
      size: {
        xs: "h-7 gap-1.5 px-2.5 text-[0.625rem] tracking-[0.12em] [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-[0.625rem] tracking-[0.13em] [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 px-5 text-[0.6875rem] tracking-[0.14em] pointer-coarse:min-h-11",
        /** Alias of `md`. */
        default: "h-10 px-5 text-[0.6875rem] tracking-[0.14em] pointer-coarse:min-h-11",
        lg: "h-12 gap-2.5 px-7 text-xs tracking-[0.16em] pointer-coarse:min-h-12",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10 pointer-coarse:size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner data-icon="inline-start" aria-hidden role="presentation" aria-label={undefined} />
      ) : null}
      <span className={loading ? "contents [&_[data-icon=inline-start]]:hidden" : "contents"}>
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export { Button, buttonVariants };
