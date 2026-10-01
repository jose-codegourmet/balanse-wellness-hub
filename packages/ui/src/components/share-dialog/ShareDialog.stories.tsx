import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Toaster } from "../sonner/Sonner";

import { ShareButton } from "./ShareDialog";
import type { ShareButtonProps } from "./ShareDialog.meta";

/** 1×1 PNG so the poster download works offline in Storybook. */
const DEMO_POSTER_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const shareArgs: ShareButtonProps = {
  url: "https://balanse.ph/sessions/reformer-pilates/2026-10-04/cm1x9k2?src=admin",
  title: "Reformer Pilates",
  subtitle: "Sat, Oct 4 · 9:00 AM · Balansé Studio, BGC",
  fileSlug: "reformer-pilates-2026-10-04",
  onCopied: () => console.info("[ShareDialog] onCopied"),
};

type NavigatorKey = "share" | "clipboard";

/** Overrides a `navigator` member for one story and returns the cleanup. */
function stubNavigator(key: NavigatorKey, value: unknown) {
  const own = Object.getOwnPropertyDescriptor(navigator, key);
  Object.defineProperty(navigator, key, { configurable: true, value });
  return () => {
    if (own) Object.defineProperty(navigator, key, own);
    else Reflect.deleteProperty(navigator, key);
  };
}

const withNativeShare = () =>
  stubNavigator("share", async (data: ShareData) => {
    console.info("[ShareDialog] navigator.share", data);
  });

const withoutNativeShare = () => stubNavigator("share", undefined);

const withFailingClipboard = () =>
  stubNavigator("clipboard", {
    writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
  });

/** Clicks the first button whose text matches, waiting for portalled content. */
async function clickButton(text: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const button = Array.from(document.querySelectorAll("button")).find((node) =>
      node.textContent?.includes(text),
    );
    if (button) {
      button.click();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const meta: Meta<typeof ShareButton> = {
  title: "Components/ShareDialog",
  component: ShareButton,
  tags: ["autodocs"],
  args: shareArgs,
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
        <Toaster />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Copy link, native share, QR (SVG + 1024px PNG) and poster download for public session and event links. `ShareButton` owns the trigger; `ShareDialog` is the controlled surface. Desktop uses Dialog, < 768px uses Drawer.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShareButton>;

/** Closed trigger. Click to open; "Share…" is stubbed so it always shows. */
export const Default: Story = {
  beforeEach: withNativeShare,
};

export const Open: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true },
  beforeEach: withNativeShare,
};

export const WithPoster: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true, posterUrl: DEMO_POSTER_URL },
  beforeEach: withNativeShare,
};

/** The poster route fails: the button shows its loading state, then an error toast. */
export const PosterDownloadError: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true, posterUrl: "/share/poster/sessions/does-not-exist" },
  beforeEach: withNativeShare,
};

/** Desktop browsers without the Web Share API: only "Copy link" is offered. */
export const WithoutNativeShare: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true },
  beforeEach: withoutNativeShare,
};

/** Clipboard rejects: a selected, read-only field with the link appears instead. */
export const ClipboardFailureFallback: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true },
  beforeEach: () => {
    const restoreShare = withoutNativeShare();
    const restoreClipboard = withFailingClipboard();
    return () => {
      restoreClipboard();
      restoreShare();
    };
  },
  play: async () => {
    await clickButton("Copy link");
  },
};

export const DisabledTrigger: Story = {
  args: { disabledReason: "Publish the session to share it" },
};

export const IconOnly: Story = {
  args: { iconOnly: true, variant: "ghost" },
  beforeEach: withNativeShare,
};

/** Below 768px the same content renders in a bottom Drawer. */
export const MobileDrawer: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true, posterUrl: DEMO_POSTER_URL },
  globals: { viewport: { value: "mobile", isRotated: false } },
  beforeEach: withNativeShare,
};
