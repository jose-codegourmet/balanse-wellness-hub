import type { AdminEvent } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventDetailPage } from "./EventDetailPage";

const meta = {
  title: "Admin/Screens/Event detail",
  component: EventDetailPage,
  tags: ["autodocs"],
} satisfies Meta<typeof EventDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const cancelledSession: AdminEvent = {
  id: "event-preview-cancelled-session",
  sessionId: "session-preview-cancelled",
  title: "Workshop on a cancelled session",
  summary: "The session was cancelled, so this event reads as cancelled.",
  description: "Preview only. The fixture catalogue keeps cancelled events on live sessions.",
  posterImage: null,
  galleryImages: [],
  venueName: "Mandani Bay — Garden Area",
  venueAddress: "Mandani Bay, Cebu",
  beneficiary: "",
  whatToBring: "Water.",
  internalNotes: "Story preview for a cancelled session.",
  registrationOpensAt: null,
  registrationClosesAt: null,
  status: "PUBLISHED",
  statusLabel: "Published",
  isPlaceholder: true,
  createdAt: "2026-09-16T02:00:00.000Z",
  updatedAt: "2026-09-16T04:00:00.000Z",
  session: {
    id: "session-preview-cancelled",
    classId: "class-pilates",
    startsAt: "2026-09-26T00:00:00.000Z",
    endsAt: "2026-09-26T01:30:00.000Z",
    capacity: 30,
    customerPrice: "1000.00",
    status: "CANCELLED",
    statusLabel: "Cancelled",
  },
};

export const PublishedSession: Story = {
  args: { eventId: "event-pilates-cause" },
};

export const DraftSessionPublishBlocked: Story = {
  args: { eventId: "event-self-defense-draft" },
};

export const CancelledEvent: Story = {
  args: { eventId: "event-capoeira-cancelled" },
};

export const CancelledSession: Story = {
  args: { eventId: cancelledSession.id, preview: cancelledSession },
};

export const Loading: Story = {
  args: { eventId: "event-pilates-cause", loading: true },
};

export const LoadFailed: Story = {
  args: { eventId: "event-pilates-cause", error: true },
};

export const NotFound: Story = {
  args: { eventId: "event-missing" },
};
