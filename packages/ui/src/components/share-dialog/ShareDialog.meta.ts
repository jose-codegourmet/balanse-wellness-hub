import type { ReactNode } from "react";

import type { ButtonVariantProps } from "../button/Button";

/**
 * # ShareDialog / ShareButton (#347, epic #343)
 *
 * One share experience for public session and event links, used from both apps
 * (`apps/web` booking detail, calendar, class pages; `apps/admin` session and
 * event detail). It offers, in this order:
 *
 * 1. **Copy link.** Writes `url` to the clipboard, raises "Link copied", and
 *    calls `onCopied`. When the clipboard is missing or rejects, a read-only,
 *    pre-selected text field with the link appears instead so the user can copy
 *    it by hand.
 * 2. **Share…** Only when `navigator.share` exists. Passes
 *    `{ title, text: subtitle, url }`. A user cancel (`AbortError`) is silent.
 * 3. **QR.** SVG, black on white (never brand-tinted, for scan reliability),
 *    error correction `M`, 4-module quiet zone. Encodes `url` with `via=qr`
 *    set. Caption shows the shortened link (host + path).
 * 4. **Download QR (PNG).** 1024×1024, `balanse-<fileSlug>-qr.png`.
 * 5. **View poster card.** Only when `posterUrl` is set. Opens the rendered
 *    poster image in a new tab, where the browser's image viewer can save it.
 *
 * Desktop (≥ 768px, Tailwind `md`) renders a `Dialog`; mobile renders a bottom
 * `Drawer` with the same content (`useIsMobile`).
 *
 * ## Which export to use
 *
 * - **`ShareButton`** — the default. Renders the trigger and owns open state.
 *   Pass `disabledReason` to render it disabled (still focusable) with a
 *   tooltip, e.g. "Publish the session to share it".
 * - **`ShareDialog`** — controlled surface without a trigger. Use when the entry
 *   point is not a button you own (a row action in a dropdown menu, a toolbar).
 *
 * ## When not to use
 *
 * - Not for sharing private/portal URLs (`/portal/*`). Only public pages.
 * - Do not fetch data inside or around it to build URLs: callers pass a final
 *   `url` already built with `withShareParams` from `@balanse/domain`, and a
 *   `posterUrl` pointing at `/share/poster/...`.
 *
 * ## Gotchas
 *
 * - **Toasts.** Both apps mount the Jabkit Base UI toaster, not Sonner. Pass
 *   `notify` so the messages reach the app toaster, e.g. in admin:
 *   `notify={(n) => notify[n.tone]({ title: n.title, description: n.description })}`.
 *   Without `notify`, messages go to Sonner's `toast` (visible only where a
 *   `@balanse/ui` `Toaster` is mounted, such as Storybook). The dialog also
 *   announces copy state inline through a polite live region, so it never
 *   depends on a toast for feedback.
 * - `fileSlug` is normalised to `[a-z0-9-]` before it is used in file names.
 * - The QR encodes `url` + `via=qr`; any `src` / `ref` already on `url` is kept.
 */

/** A message the dialog wants surfaced as a toast. */
export type ShareNotification = {
  tone: "success" | "error";
  title: string;
  description?: string;
};

export type ShareNotifier = (notification: ShareNotification) => void;

/** Content shared by `ShareDialog` and `ShareButton`. */
export type ShareContentProps = {
  /** Final public URL, already built with `withShareParams` by the caller. */
  url: string;
  /** Session or event title. Shown as the heading and passed to native share. */
  title: string;
  /** Date, time and venue line. Shown under the title and sent as share `text`. */
  subtitle?: string;
  /** `/share/poster/...` image URL. Enables "View poster card". */
  posterUrl?: string;
  /** Slug used in download file names: `balanse-<fileSlug>-qr.png`. */
  fileSlug: string;
  /** Called after a successful clipboard write. */
  onCopied?: () => void;
  /** Route toasts to the app toaster. Defaults to Sonner `toast`. */
  notify?: ShareNotifier;
};

export type ShareDialogLayout = "auto" | "dialog" | "drawer";

export type ShareDialogProps = ShareContentProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `auto` (default): Drawer below 768px, Dialog from 768px. */
  layout?: ShareDialogLayout;
};

export type ShareButtonProps = ShareContentProps & {
  /** Visible label. Defaults to "Share". With `iconOnly` it becomes the accessible name. */
  label?: string;
  /** Overrides the accessible name. Defaults to `Share <title>` when `iconOnly`. */
  "aria-label"?: string;
  /** Icon-only square button. */
  iconOnly?: boolean;
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
  className?: string;
  /** When set, the trigger is disabled (still focusable) and shows this as a tooltip. */
  disabledReason?: string;
  /** Start open (stories, deep links). */
  defaultOpen?: boolean;
  layout?: ShareDialogLayout;
  /** Optional leading icon override. Defaults to the lucide `Share2` icon. */
  icon?: ReactNode;
};
