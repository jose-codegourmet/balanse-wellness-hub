import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShareAction } from "./ShareAction";

const meta: Meta<typeof ShareAction> = {
  title: "Balanse/Share/ShareAction",
  component: ShareAction,
  tags: ["autodocs"],
  args: {
    url: "http://localhost:9000/sessions/mat-pilates/2026-09-26/session-event-pilates?ref=BENSNT26&src=customer",
    title: "Pilates for a Cause",
    subtitle: "Sat, Sep 26 · 8:00 AM · Mandani Bay",
    fileSlug: "mat-pilates-2026-09-26",
  },
};

export default meta;
type Story = StoryObj<typeof ShareAction>;

export const Default: Story = {};
export const WithPoster: Story = {
  args: { posterUrl: "/share/poster/sessions/session-event-pilates?ref=BENSNT26&src=customer" },
};
export const IconOnly: Story = { args: { iconOnly: true } };
export const Disabled: Story = { args: { disabledReason: "Publish the session to share it" } };
