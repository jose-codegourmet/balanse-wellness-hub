import { adminSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
// This one manual clock-regression story intentionally bypasses the preview alias.
import { adminTodayYmd as liveToday } from "../../../lib/clock";

import { AdminScheduleCalendar } from "./AdminScheduleCalendar";
import type { AdminCalendarView } from "./AdminScheduleCalendar.meta";
import { adminScheduleCalendarDefaultValues } from "./AdminScheduleCalendar.stories-data";

function StatefulCalendar({
  view,
  selectedDay: initialDay,
  sessions,
  readToday,
}: {
  view: AdminCalendarView;
  selectedDay?: string;
  sessions?: typeof adminSessions;
  readToday?: () => string;
}) {
  const [anchorDay, setAnchorDay] = useState(initialDay ?? "2026-09-16");
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  return (
    <div className="flex h-[48rem]">
      <AdminScheduleCalendar
        className="flex-1"
        sessions={sessions ?? adminSessions}
        todayYmd={readToday?.() ?? "2026-09-16"}
        anchorDay={anchorDay}
        selectedDay={openDay}
        selectedSessionId={selectedSessionId}
        view={view}
        onNavigate={setAnchorDay}
        onToday={readToday ? () => setAnchorDay(readToday()) : undefined}
        onOpenDay={(ymd) => {
          setOpenDay(ymd);
          setSelectedSessionId(null);
        }}
        onOpenSession={(session, ymd) => {
          setOpenDay(ymd);
          setSelectedSessionId(session.id);
        }}
      />
    </div>
  );
}

const meta: Meta<typeof AdminScheduleCalendar> = {
  title: "Admin/Components/AdminScheduleCalendar",
  component: AdminScheduleCalendar,
  tags: ["autodocs"],
  args: {
    ...adminScheduleCalendarDefaultValues,
    sessions: adminSessions,
    onNavigate: () => undefined,
    onOpenDay: () => undefined,
    onOpenSession: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopMonth1280: Story = {
  render: () => <StatefulCalendar view="month" />,
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const TabletWeek768: Story = {
  render: () => <StatefulCalendar view="week" />,
  parameters: { viewport: { defaultViewport: "tablet" } },
};

/** Manual regression: Today leaves the September fixtures for the real Manila date. */
export const TodayFromPreviousMonth: Story = {
  render: () => <StatefulCalendar view="month" selectedDay="2026-09-16" readToday={liveToday} />,
};

export const MobileDay360: Story = {
  render: () => <StatefulCalendar view="day" />,
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const EmptyWeek: Story = {
  render: () => <StatefulCalendar view="week" sessions={[]} selectedDay="2026-09-21" />,
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const DenseDay: Story = {
  render: () => <StatefulCalendar view="day" selectedDay="2026-09-16" />,
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const Auto: Story = {
  args: { view: "auto" },
};

const overnightSessions = [
  {
    ...adminSessions[0],
    id: "overnight-calendar",
    name: "Poker Bluffing",
    startsAt: "2026-10-13T21:45:00+08:00",
    endsAt: "2026-10-14T01:45:00+08:00",
  },
];

export const OvernightContinuation: Story = {
  render: () => (
    <StatefulCalendar view="month" selectedDay="2026-10-14" sessions={overnightSessions} />
  ),
};
