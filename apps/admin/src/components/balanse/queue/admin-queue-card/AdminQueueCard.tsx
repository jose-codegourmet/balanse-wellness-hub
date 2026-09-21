import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  StatusBadge,
} from "@balanse/ui";

import type { AdminQueueCardProps } from "./AdminQueueCard.schema";

export function AdminQueueCard({
  who,
  what,
  when,
  status,
  body,
  media,
  actions,
  emphasis = false,
  className,
}: AdminQueueCardProps) {
  return (
    <Card
      data-slot="admin-queue-card"
      data-emphasis={emphasis ? "needs-action" : undefined}
      className={cn(emphasis && "ring-2 ring-primary/40", className)}
    >
      <CardHeader className="border-b">
        <CardTitle>{who}</CardTitle>
        <CardDescription>
          <span>{what}</span>
          <span className="mx-1.5 text-muted-foreground/70" aria-hidden="true">
            ·
          </span>
          <time>{when}</time>
        </CardDescription>
        <CardAction>
          <StatusBadge status={status} surface="admin" />
        </CardAction>
      </CardHeader>
      {body || media ? (
        <CardContent className="space-y-3">
          {body ? <div className="text-sm">{body}</div> : null}
          {media ? <div className="max-w-xs">{media}</div> : null}
        </CardContent>
      ) : null}
      {actions ? <CardFooter className="flex flex-wrap gap-2">{actions}</CardFooter> : null}
    </Card>
  );
}

export type { AdminQueueCardProps };
