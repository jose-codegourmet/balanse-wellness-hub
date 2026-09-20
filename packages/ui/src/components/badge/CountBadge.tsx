import { cn } from "../../lib/utils";
import { Badge } from "./Badge";
import type { CountBadgeProps } from "./CountBadge.schema";

function CountBadge({
  count,
  max = 99,
  className,
  "aria-label": ariaLabel,
  ...props
}: CountBadgeProps) {
  const overflowed = count > max;
  const display = overflowed ? `${max}+` : String(count);

  return (
    <Badge
      variant="neutral"
      appearance="soft"
      size="sm"
      className={cn("min-w-7 justify-center px-1.5 tabular-nums", className)}
      aria-label={ariaLabel ?? `${count} items`}
      {...props}
    >
      {display}
    </Badge>
  );
}

export { CountBadge };
