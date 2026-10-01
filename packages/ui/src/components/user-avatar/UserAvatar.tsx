"use client";

import { avatarToneFor, getInitials } from "@balanse/domain";
import type * as React from "react";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar/Avatar";
import type { UserAvatarProps, UserAvatarSize, UserAvatarStackProps } from "./UserAvatar.meta";

const SIZE_CLASS: Record<UserAvatarSize, string> = {
  sm: "size-6 text-[10px]",
  default: "size-8 text-xs",
  lg: "size-10 text-sm",
  xl: "size-20 text-2xl",
};

/**
 * Customer avatar: photo when `avatarUrl` loads, otherwise initials on a
 * deterministic brand tone. A broken image falls back to initials.
 */
export function UserAvatar({
  name,
  avatarUrl,
  seed,
  size = "default",
  label,
  className,
  placeholder = false,
}: UserAvatarProps) {
  const initials = name ? getInitials(name) : "";
  const tone = avatarToneFor(seed ?? initials);
  const accessibleName = label ?? (name ? `${name.firstName} ${name.lastName}`.trim() : undefined);

  if (placeholder) {
    return (
      <span
        aria-hidden="true"
        data-slot="user-avatar"
        data-placeholder="true"
        className={cn(
          "inline-flex shrink-0 rounded-full border border-dashed border-border bg-muted/60",
          SIZE_CLASS[size],
          className,
        )}
      />
    );
  }

  return (
    <Avatar
      data-slot="user-avatar"
      className={cn(SIZE_CLASS[size], className)}
      aria-label={avatarUrl ? undefined : accessibleName}
      role={avatarUrl ? undefined : "img"}
    >
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={accessibleName ?? ""} /> : null}
      <AvatarFallback
        className="font-medium tracking-wide"
        style={{ background: tone.background, color: tone.foreground } as React.CSSProperties}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

/** Overlapping avatar stack with an optional "+N" overflow chip. */
export function UserAvatarStack({
  people,
  max = 5,
  size = "default",
  overflowCount,
  placeholderCount,
  className,
  label,
}: UserAvatarStackProps) {
  const shown = people.slice(0, max);
  const hiddenPeople = Math.max(0, people.length - shown.length);
  const extra = (overflowCount ?? 0) + hiddenPeople;
  const placeholders = placeholderCount ? Math.min(placeholderCount, max) : 0;
  return (
    <div
      data-slot="user-avatar-stack"
      role="group"
      aria-label={label}
      className={cn("flex items-center -space-x-2", className)}
    >
      {shown.map((person) => (
        <UserAvatar
          key={person.key}
          name={person.name}
          avatarUrl={person.avatarUrl}
          seed={person.key}
          size={size}
          label={person.label}
          className="ring-2 ring-background"
        />
      ))}
      {Array.from({ length: placeholders }, (_, index) => (
        <UserAvatar
          key={`placeholder-${index}`}
          placeholder
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {extra > 0 ? (
        <span
          data-slot="user-avatar-overflow"
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            SIZE_CLASS[size],
          )}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
