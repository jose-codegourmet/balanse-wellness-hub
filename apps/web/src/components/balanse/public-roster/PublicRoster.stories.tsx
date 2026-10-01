import type { PublicRosterAttendee } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicRoster } from "./PublicRoster";

const AVATAR = "/assets/placeholders/avatars/avatar-0";

const attendees: PublicRosterAttendee[] = [
  { key: "r1", displayName: "Clara", avatarUrl: `${AVATAR}1.svg`, initials: "MR", isSelf: false },
  { key: "r2", displayName: "Migs", avatarUrl: null, initials: "JT", isSelf: false },
  {
    key: "r3",
    displayName: "Patricia",
    avatarUrl: `${AVATAR}3.svg`,
    initials: "PL",
    isSelf: false,
  },
  { key: "r4", displayName: "Bea", avatarUrl: `${AVATAR}4.svg`, initials: "BV", isSelf: false },
  { key: "r5", displayName: "Raf", avatarUrl: null, initials: "RC", isSelf: false },
  { key: "r6", displayName: "Andi", avatarUrl: `${AVATAR}6.svg`, initials: "AL", isSelf: false },
  { key: "r7", displayName: "Paolo", avatarUrl: null, initials: "PR", isSelf: false },
  { key: "r8", displayName: "Kimmy", avatarUrl: `${AVATAR}2.svg`, initials: "KA", isSelf: false },
  { key: "r9", displayName: "Luis", avatarUrl: null, initials: "LF", isSelf: false },
  { key: "r10", displayName: "Trish", avatarUrl: `${AVATAR}3.svg`, initials: "TN", isSelf: false },
  { key: "r11", displayName: "Ana", avatarUrl: null, initials: "AD", isSelf: false },
  { key: "r12", displayName: "Gina", avatarUrl: null, initials: "GT", isSelf: false },
];

const meta: Meta<typeof PublicRoster> = {
  title: "Balanse/Public/PublicRoster",
  component: PublicRoster,
  tags: ["autodocs"],
  args: {
    loginHref: "/login?returnTo=/sessions/mat-pilates/2026-09-26/session-event-pilates",
    signUpHref: "/sign-up?returnTo=/sessions/mat-pilates/2026-09-26/session-event-pilates",
  },
  decorators: [(Story) => <div className="max-w-3xl p-4">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof PublicRoster>;

export const GuestCounts: Story = {
  args: { roster: { visibility: "counts", goingCount: 11, spotsLeft: 17 } },
};

export const GuestEmpty: Story = {
  args: { roster: { visibility: "counts", goingCount: 0, spotsLeft: 30 } },
};

export const CustomerList: Story = {
  args: {
    roster: { visibility: "list", goingCount: 12, spotsLeft: 18, hiddenCount: 0, attendees },
  },
};

export const WithHiddenOthers: Story = {
  args: {
    roster: {
      visibility: "list",
      goingCount: 11,
      spotsLeft: 17,
      hiddenCount: 2,
      attendees: [
        { ...attendees[0], key: "self", displayName: "Benny", isSelf: true },
        ...attendees.slice(1, 9),
      ],
    },
  },
};

export const ViewerOptedOut: Story = {
  args: {
    roster: {
      visibility: "list",
      goingCount: 4,
      spotsLeft: 8,
      hiddenCount: 0,
      attendees: [
        {
          key: "self",
          displayName: "Carlo",
          avatarUrl: null,
          initials: "CM",
          isSelf: true,
          hiddenFromOthers: true,
        },
        ...attendees.slice(0, 3),
      ],
    },
  },
};

export const CustomerEmpty: Story = {
  args: {
    roster: { visibility: "list", goingCount: 0, spotsLeft: 12, hiddenCount: 0, attendees: [] },
  },
};

export const Cancelled: Story = {
  args: {
    state: "cancelled",
    roster: {
      visibility: "list",
      goingCount: 2,
      spotsLeft: 18,
      hiddenCount: 0,
      attendees: attendees.slice(0, 2),
    },
  },
};
