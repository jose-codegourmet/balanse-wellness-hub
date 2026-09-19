import { MOCK_NOW_ISO, publicClasses, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScheduleCalendar } from "./ScheduleCalendar";

const meta = {
  title: "Shared/ScheduleCalendar",
  component: ScheduleCalendar,
  args: {
    sessions: publicSessions,
    classes: publicClasses,
    nowIso: MOCK_NOW_ISO,
    view: "week",
  },
} satisfies Meta<typeof ScheduleCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MobileDay: Story = { args: { view: "day" } };
export const TabletWeek: Story = { args: { view: "week" } };
export const DesktopMonth: Story = { args: { view: "month" } };

export const GuestReserve: Story = {
  args: { audience: "guest", view: "day" },
};

export const CustomerOwnBookings: Story = {
  args: {
    audience: "customer",
    view: "week",
    viewerBookingSessionIds: ["session-wed-open"],
  },
};

export const FullWaitlist: Story = {
  args: {
    view: "day",
    nowIso: "2026-09-19T01:00:00.000Z",
    selectedSessionId: "session-sat-full",
  },
};

export const ClosedCutoff: Story = {
  args: { view: "day", selectedSessionId: "session-wed-cutoff" },
};

export const PastSession: Story = {
  args: {
    view: "day",
    nowIso: "2026-09-14T00:30:00.000Z",
    selectedSessionId: "session-past-open",
  },
};

export const CancelledSession: Story = {
  args: {
    view: "day",
    nowIso: "2026-09-18T02:00:00.000Z",
    selectedSessionId: "session-fri-cancelled",
  },
};

export const EmptyDay: Story = {
  args: { view: "day", nowIso: "2026-09-17T02:00:00.000Z" },
};

export const FilterEmpty: Story = {
  args: { view: "week", initialClassFilter: "class-bjj" },
};

export const LoadFailed: Story = {
  args: { loadError: true },
};

export const BecameFull: Story = {
  args: {
    view: "day",
    sessionBecameFullId: "session-wed-open",
    selectedSessionId: "session-wed-open",
  },
};

export const Loading: Story = {
  args: { loading: true },
};
