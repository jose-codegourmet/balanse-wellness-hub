"use client";

import {
  type AdminEvent,
  type AdminSession,
  buildPublicEventPath,
  buildPublicSessionPath,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
  slugify,
  toManilaDateSegment,
  withShareParams,
} from "@balanse/domain";
import { Button, ShareButton } from "@balanse/ui";
import { ExternalLinkIcon } from "lucide-react";
import { getWebOrigin } from "@/lib/web-origin";
import { notify } from "@/modules/notifications/notify";
import type { PublicShareActionProps, PublicShareTarget } from "./PublicShareAction.meta";

const STUDIO = { src: "studio" } as const;

/** Share props for a session. `classSlug` comes from the admin class list. */
export function sessionShareTarget(
  session: Pick<AdminSession, "id" | "startsAt" | "endsAt" | "status" | "name" | "className">,
  classSlug: string | null | undefined,
  venueName?: string | null,
): PublicShareTarget {
  const path = buildPublicSessionPath({
    classSlug: classSlug ?? slugify(session.className, "session"),
    startsAt: session.startsAt,
    id: session.id,
  });
  const cancelled = session.status === "CANCELLED";
  return {
    path,
    title: sessionDisplayName(session),
    subtitle: `${formatSessionDate(session.startsAt)} · ${formatSessionTimeRange(
      session.startsAt,
      session.endsAt,
    )}${venueName ? ` · ${venueName}` : ""}`,
    posterPath: cancelled ? null : `/share/poster/sessions/${encodeURIComponent(session.id)}`,
    fileSlug: `${classSlug ?? slugify(session.className)}-${toManilaDateSegment(session.startsAt)}`,
    disabledReason: session.status === "DRAFT" ? "Publish the session to share it" : undefined,
  };
}

/** Share props for an event. Draft and archived events cannot be shared. */
export function eventShareTarget(event: AdminEvent): PublicShareTarget {
  const path = buildPublicEventPath({
    title: event.title,
    startsAt: event.session.startsAt,
    id: event.id,
  });
  const cancelled = event.status === "CANCELLED" || event.session.status === "CANCELLED";
  return {
    path,
    title: event.title,
    subtitle: `${formatSessionDate(event.session.startsAt)} · ${formatSessionTimeRange(
      event.session.startsAt,
      event.session.endsAt,
    )}${event.session.venue ? ` · ${event.session.venue.name}` : ""}`,
    posterPath: cancelled ? null : `/share/poster/events/${encodeURIComponent(event.id)}`,
    fileSlug: `${slugify(event.title, "event")}-${toManilaDateSegment(event.session.startsAt)}`,
    disabledReason:
      event.status === "DRAFT"
        ? "Publish the event to share it"
        : event.status === "ARCHIVED"
          ? "Archived events can’t be shared"
          : event.session.status === "DRAFT"
            ? "Publish the session to share it"
            : undefined,
  };
}

/**
 * Studio share action for admin: link + QR + poster to the public page on the
 * web origin, tagged `src=studio` so sign-ups count as studio marketing.
 */
export function PublicShareAction({
  target,
  showOpenLink = true,
  size = "sm",
  label = "Share",
  className,
}: PublicShareActionProps) {
  const origin = getWebOrigin();
  const url = withShareParams(`${origin}${target.path}`, STUDIO);
  const posterUrl = target.posterPath
    ? withShareParams(`${origin}${target.posterPath}`, STUDIO)
    : undefined;
  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      <ShareButton
        url={url}
        title={target.title}
        subtitle={target.subtitle}
        posterUrl={posterUrl}
        fileSlug={target.fileSlug}
        disabledReason={target.disabledReason}
        size={size}
        label={label}
        notify={(message) =>
          notify[message.tone]({ title: message.title, description: message.description })
        }
      />
      {showOpenLink && !target.disabledReason ? (
        <Button
          nativeButton={false}
          variant="ghost"
          size={size}
          render={<a href={`${origin}${target.path}`} target="_blank" rel="noreferrer" />}
        >
          <ExternalLinkIcon aria-hidden />
          Open public page
        </Button>
      ) : null}
    </div>
  );
}
