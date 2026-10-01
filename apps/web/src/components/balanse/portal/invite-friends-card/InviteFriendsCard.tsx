import { UserPlus } from "lucide-react";
import { ShareAction } from "@/components/balanse/share-action/ShareAction";
import type { InviteFriendsCardProps } from "./InviteFriendsCard.meta";

/** "Bring a friend" card on booking detail; shares the public page with the customer's ref. */
export function InviteFriendsCard({ invite }: InviteFriendsCardProps) {
  return (
    <section
      data-section="invite-friends"
      aria-labelledby="invite-friends-title"
      className="portal-section flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <UserPlus aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
        <div>
          <h2 id="invite-friends-title" className="font-display text-xl">
            Invite friends
          </h2>
          <p className="text-sm text-muted-foreground">
            Bring a friend to {invite.title} on {invite.dateLabel}. They&rsquo;ll see who&rsquo;s
            going once they sign in.
          </p>
        </div>
      </div>
      <ShareAction
        url={invite.url}
        title={invite.title}
        subtitle={invite.subtitle}
        posterUrl={invite.posterUrl}
        fileSlug={invite.fileSlug}
        label="Invite friends"
        variant="accent"
      />
    </section>
  );
}
