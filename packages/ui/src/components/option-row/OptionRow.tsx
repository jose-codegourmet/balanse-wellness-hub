import { cn } from "../../lib/utils";
import type { OptionRowProps } from "./OptionRow.schema";

export function OptionRow({
  label,
  leading,
  description,
  descriptionId,
  compact = false,
  reserveLeading = leading != null,
  className,
}: OptionRowProps) {
  const showDescription = !compact && Boolean(description);

  return (
    <span
      data-slot="option-row"
      data-compact={compact || undefined}
      className={cn("flex min-w-0 items-center gap-2", className)}
    >
      {reserveLeading ? (
        <span
          data-slot="option-leading"
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&_img]:size-full [&_img]:object-cover [&_[data-slot=avatar]]:size-7"
        >
          {leading}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span data-slot="option-label" className="truncate text-sm leading-5">
          {label}
        </span>
        {showDescription ? (
          <span
            id={descriptionId}
            data-slot="option-description"
            className="truncate text-xs leading-4 text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export type { ChoiceOption, OptionRowProps } from "./OptionRow.schema";
export { choiceOptionFilterText } from "./OptionRow.schema";
