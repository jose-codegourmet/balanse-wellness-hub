import {
  FEEDBACK_STATE_DEFAULTS,
  type FeedbackStateCopy,
  type FeedbackStateId,
} from "@balanse/domain";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "../../components/button/Button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../components/empty/Empty";
import { Skeleton } from "../../components/skeleton/Skeleton";
import { cn } from "../../lib/utils";

export function FeedbackState({
  id,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  id: FeedbackStateId;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const defaults: FeedbackStateCopy = FEEDBACK_STATE_DEFAULTS[id];
  const copy = {
    title: title ?? defaults.title,
    description: description ?? defaults.description,
    actionLabel: actionLabel ?? defaults.actionLabel,
    kind: defaults.kind,
  };
  const Icon = copy.kind === "error" ? AlertTriangle : Inbox;

  return (
    <Empty className={cn("border border-dashed border-border bg-card", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
      {copy.actionLabel && onAction ? (
        <EmptyContent>
          <Button
            type="button"
            variant={copy.kind === "error" ? "default" : "outline"}
            onClick={onAction}
          >
            {copy.actionLabel}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

/**
 * Localized skeleton — never a full-page spinner.
 * Prefer a page shell (`TablePageSkeleton`, `CardListSkeleton`, …) for whole-page
 * loading. This helper is for genuinely inline stacks. `lines` silently caps at 8.
 */
export function LocalizedSkeleton({
  lines = 3,
  className,
  label = "Loading",
}: {
  lines?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {["one", "two", "three", "four", "five", "six", "seven", "eight"]
        .slice(0, lines)
        .map((lineKey) => (
          <Skeleton key={lineKey} className="h-10 w-full" />
        ))}
    </div>
  );
}
