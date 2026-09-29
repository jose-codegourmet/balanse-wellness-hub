"use client";

import { formatSessionDate, formatSessionTimeRange } from "@balanse/domain";
import { CalendarIcon, HeartHandshakeIcon, ImageIcon, ImagesIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventPreviewCardProps } from "./EventPreviewCard.meta";

export function EventPreviewCard({
  title,
  summary,
  posterSrc,
  posterPending = false,
  beneficiary,
  venueName,
  galleryCount,
  session,
  className,
}: EventPreviewCardProps) {
  return (
    <article
      aria-label="Customer preview"
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {posterSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterSrc} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <span className="grid justify-items-center gap-1 text-xs">
              <ImageIcon aria-hidden className="size-6" />
              {posterPending ? "Poster added" : "No poster yet"}
            </span>
          </div>
        )}
        {beneficiary.trim() ? (
          <span className="absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 truncate rounded-sm bg-background/90 px-2.5 py-1 text-[0.6875rem] font-medium backdrop-blur">
            <HeartHandshakeIcon aria-hidden className="size-3 shrink-0 text-primary" />
            <span className="truncate">For {beneficiary.trim()}</span>
          </span>
        ) : null}
        {galleryCount > 0 ? (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-sm bg-background/90 px-2 py-0.5 text-[0.6875rem] backdrop-blur">
            <ImagesIcon aria-hidden className="size-3" />+{galleryCount}
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 p-4">
        <div className="grid gap-1">
          <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {session?.className ?? "Event"}
          </p>
          <h3
            className={cn(
              "font-display text-xl leading-tight",
              !title.trim() && "text-muted-foreground",
            )}
          >
            {title.trim() || "Your event title"}
          </h3>
          {summary.trim() ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">{summary.trim()}</p>
          ) : null}
        </div>
        <ul className="grid gap-1.5 text-sm">
          <li className="flex items-start gap-2">
            <CalendarIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            {session ? (
              <span>
                {formatSessionDate(session.startsAt)}
                <br />
                <span className="text-muted-foreground">
                  {formatSessionTimeRange(session.startsAt, session.endsAt)}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Pick a session to set the date</span>
            )}
          </li>
          <li className="flex items-start gap-2">
            <MapPinIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className={cn(!venueName.trim() && "text-muted-foreground")}>
              {venueName.trim() || "Venue to be announced"}
            </span>
          </li>
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="font-medium">{session?.priceLabel ?? "—"}</span>
          <span className="text-muted-foreground">
            {session
              ? `${session.capacity} ${session.capacity === 1 ? "spot" : "spots"}`
              : "Capacity from session"}
          </span>
        </div>
      </div>
    </article>
  );
}
