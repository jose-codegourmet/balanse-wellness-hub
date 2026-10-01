import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InviteFriendsCard } from "./InviteFriendsCard";

const meta: Meta<typeof InviteFriendsCard> = {
  title: "Portal/Bookings/InviteFriendsCard",
  component: InviteFriendsCard,
  tags: ["autodocs"],
  args: {
    invite: {
      url: "http://localhost:9000/events/pilates-for-a-cause/2026-09-26/event-pilates-cause?ref=BENSNT26&src=customer",
      posterUrl: "/share/poster/events/event-pilates-cause?ref=BENSNT26&src=customer",
      fileSlug: "pilates-for-a-cause-2026-09-26",
      title: "Pilates for a Cause",
      subtitle: "Sat, Sep 26, 2026 · 8:00 AM – 9:30 AM",
      dateLabel: "Sat, Sep 26, 2026",
    },
  },
  decorators: [(Story) => <div className="max-w-3xl p-4">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof InviteFriendsCard>;

export const Default: Story = {};
