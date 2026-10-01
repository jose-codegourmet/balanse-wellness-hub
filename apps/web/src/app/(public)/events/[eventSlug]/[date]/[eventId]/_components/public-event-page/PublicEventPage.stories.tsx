import type { PublicEventPage as PublicEventPageData } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicEventPage } from "./PublicEventPage";

const event: PublicEventPageData = {
  id: "event-pilates-cause",
  title: "Pilates for a Cause",
  summary: "Off-site pilates morning. Proceeds support Everlasting Hope Cebu.",
  description:
    "Registration at 7:30 AM, pilates at 8:00 AM at the Mandani Bay Garden Area.\nBring a friend — every slot supports the cause.",
  posterImage: "/assets/marketing/classes/mat-pilates-hero.webp",
  galleryImages: [
    "/assets/marketing/classes/mat-pilates-hero.webp",
    "/assets/marketing/classes/yoga-hero.webp",
  ],
  beneficiary: "Everlasting Hope Cebu, Banawa",
  whatToBring: "Mat, water, and a towel.",
  registrationOpensAt: "2026-09-14T00:00:00.000Z",
  registrationClosesAt: "2026-09-25T23:30:00.000Z",
  status: "PUBLISHED",
  session: {
    id: "session-event-pilates",
    name: "Pilates for a Cause",
    classId: "class-pilates",
    className: "Mat Pilates",
    classSlug: "mat-pilates",
    classShortDescription: "Core-focused mat work.",
    heroImage: "/assets/marketing/classes/mat-pilates-hero.webp",
    coaches: [{ id: "coach-jodi", name: "Jodi Tio", photoKey: "coach-photos/jodi-tio" }],
    coachesDetailed: [
      {
        id: "coach-jodi",
        name: "Jodi Tio",
        photoKey: "coach-photos/jodi-tio",
        specialties: ["Mat Pilates"],
      },
    ],
    coachName: "Jodi Tio",
    startsAt: "2026-09-26T00:00:00.000Z",
    endsAt: "2026-09-26T01:30:00.000Z",
    pricePhp: 1000,
    capacity: 30,
    remainingSlots: 17,
    reservable: true,
    availability: "open",
    status: "PUBLISHED",
    venue: { name: "Mandani Bay — Garden Area", address: "Mandaue City, Cebu" },
    event: { id: "event-pilates-cause", title: "Pilates for a Cause", status: "PUBLISHED" },
  },
};

const meta: Meta<typeof PublicEventPage> = {
  title: "Public/Events/PublicEventPage",
  component: PublicEventPage,
  parameters: { layout: "fullscreen" },
  args: {
    event,
    roster: { visibility: "counts", goingCount: 11, spotsLeft: 17 },
    viewer: null,
    existingBookingId: null,
    currentPath: "/events/pilates-for-a-cause/2026-09-26/event-pilates-cause",
    share: {
      url: "http://localhost:9000/events/pilates-for-a-cause/2026-09-26/event-pilates-cause",
      posterUrl: "/share/poster/events/event-pilates-cause",
      fileSlug: "pilates-for-a-cause-2026-09-26",
    },
    nowIso: "2026-09-16T02:50:00.000Z",
  },
};

export default meta;
type Story = StoryObj<typeof PublicEventPage>;

export const FullContent: Story = {};

export const Minimal: Story = {
  args: {
    event: { ...event, posterImage: null, galleryImages: [], beneficiary: "", whatToBring: "" },
  },
};

export const RegistrationNotOpen: Story = {
  args: { event: { ...event, registrationOpensAt: "2026-09-20T00:00:00.000Z" } },
};

export const RegistrationClosed: Story = {
  args: { event: { ...event, registrationClosesAt: "2026-09-15T00:00:00.000Z" } },
};

export const CancelledEvent: Story = {
  args: {
    event: { ...event, status: "CANCELLED" },
    share: { url: "http://localhost:9000/events/x", fileSlug: "pilates-for-a-cause" },
  },
};

export const CancelledViaSession: Story = {
  args: {
    event: {
      ...event,
      status: "CANCELLED",
      session: { ...event.session, status: "CANCELLED", availability: "cancelled" },
    },
    share: { url: "http://localhost:9000/events/x", fileSlug: "pilates-for-a-cause" },
  },
};

export const PastWithBeneficiary: Story = {
  args: {
    event: { ...event, session: { ...event.session, availability: "past" } },
    share: null,
  },
};

export const SignedInCustomer: Story = {
  args: {
    viewer: { customerId: "cust-ben" },
    existingBookingId: "booking-community-pil-ben",
    roster: {
      visibility: "list",
      goingCount: 11,
      spotsLeft: 17,
      hiddenCount: 2,
      attendees: ["Benny", "Clara", "Migs", "Patricia", "Bea", "Raf", "Andi", "Paolo", "Kimmy"].map(
        (name, index) => ({
          key: `k${index}`,
          displayName: name,
          avatarUrl:
            index % 2 ? `/assets/placeholders/avatars/avatar-0${(index % 6) + 1}.svg` : null,
          initials: name.slice(0, 2).toUpperCase(),
          isSelf: index === 0,
        }),
      ),
    },
  },
};
