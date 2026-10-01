import type { PublicSessionPage as PublicSessionPageData } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicSessionPage } from "./PublicSessionPage";

const session: PublicSessionPageData = {
  id: "session-sat-full",
  name: null,
  classId: "class-yoga",
  className: "Yoga",
  classSlug: "yoga",
  classShortDescription: "Breath-led flow to build strength, balance, and calm.",
  heroImage: "/assets/marketing/classes/yoga-hero.webp",
  coaches: [{ id: "coach-wolf", name: "Wolf", photoKey: "coach-photos/wolf" }],
  coachesDetailed: [
    { id: "coach-wolf", name: "Wolf", photoKey: "coach-photos/wolf", specialties: ["Yoga"] },
  ],
  coachName: "Wolf",
  startsAt: "2026-09-19T01:30:00.000Z",
  endsAt: "2026-09-19T02:30:00.000Z",
  pricePhp: 550,
  capacity: 10,
  remainingSlots: 3,
  reservable: true,
  availability: "nearly_full",
  status: "PUBLISHED",
  venue: { name: "Balansé Studio", address: "Unit 2A, Cebu City" },
  event: null,
};

const attendees = ["Clara", "Migs", "Bea", "Andi", "Kimmy", "Raf", "Trish"].map((name, index) => ({
  key: `k${index}`,
  displayName: name,
  avatarUrl: index % 2 ? null : `/assets/placeholders/avatars/avatar-0${(index % 6) + 1}.svg`,
  initials: name.slice(0, 2).toUpperCase(),
  isSelf: false,
}));

const meta: Meta<typeof PublicSessionPage> = {
  title: "Public/Sessions/PublicSessionPage",
  component: PublicSessionPage,
  parameters: { layout: "fullscreen" },
  args: {
    session,
    roster: { visibility: "counts", goingCount: 7, spotsLeft: 3 },
    viewer: null,
    existingBookingId: null,
    currentPath: "/sessions/yoga/2026-09-19/session-sat-full",
    eventHref: null,
    share: {
      url: "http://localhost:9000/sessions/yoga/2026-09-19/session-sat-full",
      posterUrl: "/share/poster/sessions/session-sat-full",
      fileSlug: "yoga-2026-09-19",
    },
    nowIso: "2026-09-16T02:50:00.000Z",
  },
};

export default meta;
type Story = StoryObj<typeof PublicSessionPage>;

export const Guest: Story = {};

export const SignedInCustomer: Story = {
  args: {
    viewer: { customerId: "cust-ana" },
    roster: { visibility: "list", goingCount: 9, spotsLeft: 3, hiddenCount: 2, attendees },
  },
};

export const AlreadyBooked: Story = {
  args: {
    viewer: { customerId: "cust-m-05" },
    existingBookingId: "booking-community-full-05",
    roster: {
      visibility: "list",
      goingCount: 8,
      spotsLeft: 3,
      hiddenCount: 1,
      attendees: [{ ...attendees[2], isSelf: true }, ...attendees.slice(0, 2)],
    },
  },
};

export const PartOfEvent: Story = {
  args: {
    session: {
      ...session,
      event: { id: "event-pilates-cause", title: "Pilates for a Cause", status: "PUBLISHED" },
    },
    eventHref: "/events/pilates-for-a-cause/2026-09-26/event-pilates-cause",
  },
};

export const FullWaitlist: Story = {
  args: { session: { ...session, availability: "full_with_waitlist", remainingSlots: 0 } },
};

export const Cancelled: Story = {
  args: {
    session: { ...session, status: "CANCELLED", availability: "cancelled", reservable: false },
    share: {
      url: "http://localhost:9000/sessions/yoga/2026-09-19/session-sat-full",
      fileSlug: "yoga-2026-09-19",
    },
  },
};

export const Ended: Story = {
  args: {
    session: { ...session, availability: "past", reservable: false },
    share: null,
    viewer: { customerId: "cust-ana" },
    roster: { visibility: "list", goingCount: 3, spotsLeft: 0, hiddenCount: 1, attendees },
  },
};
