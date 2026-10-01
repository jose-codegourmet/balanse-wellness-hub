import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicShareAction } from "./PublicShareAction";

const meta: Meta<typeof PublicShareAction> = {
  title: "Admin/Share/PublicShareAction",
  component: PublicShareAction,
  tags: ["autodocs"],
  args: {
    target: {
      path: "/events/pilates-for-a-cause/2026-09-26/event-pilates-cause",
      title: "Pilates for a Cause",
      subtitle: "Sat, Sep 26, 2026 · 8:00 AM – 9:30 AM · Mandani Bay — Garden Area",
      posterPath: "/share/poster/events/event-pilates-cause",
      fileSlug: "pilates-for-a-cause-2026-09-26",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PublicShareAction>;

export const Published: Story = {};
export const DraftDisabled: Story = {
  args: {
    target: {
      path: "/events/self-defense-workshop/2026-10-03/event-self-defense-draft",
      title: "Self-Defense Workshop",
      subtitle: "Sat, Oct 3, 2026",
      posterPath: null,
      fileSlug: "self-defense-workshop-2026-10-03",
      disabledReason: "Publish the event to share it",
    },
  },
};
export const CancelledNoPoster: Story = {
  args: {
    target: {
      path: "/events/capoeira-workshop/2026-10-10/event-capoeira-cancelled",
      title: "Capoeira Workshop",
      subtitle: "Sat, Oct 10, 2026",
      posterPath: null,
      fileSlug: "capoeira-workshop-2026-10-10",
    },
  },
};
