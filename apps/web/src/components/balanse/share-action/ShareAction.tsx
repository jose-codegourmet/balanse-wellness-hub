"use client";

import { ShareButton, type ShareButtonProps } from "@balanse/ui";
import { notify } from "@/modules/notifications/notify";

export type ShareActionProps = Omit<ShareButtonProps, "notify">;

/**
 * `@balanse/ui` `ShareButton` wired to the web app's Jabkit toaster.
 * Callers pass a final `url` built with `withShareParams`.
 */
export function ShareAction(props: ShareActionProps) {
  return (
    <ShareButton
      {...props}
      notify={(message) =>
        notify[message.tone]({ title: message.title, description: message.description })
      }
    />
  );
}
