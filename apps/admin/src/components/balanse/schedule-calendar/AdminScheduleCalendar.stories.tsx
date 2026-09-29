import { adminSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { AdminScheduleCalendar } from "./AdminScheduleCalendar";
import type { AdminCalendarView } from "./AdminScheduleCalendar.meta";
import { adminScheduleCalendarDefaultValues } from "./AdminScheduleCalendar.stories-data";

function StatefulCalendar({
  view,
  selectedDay: initialDay,
  sessions,
}: {
  view: AdminCalendarView;
  selectedDay?: string;
  sessions?: typeof adminSessions;
}) {
  const [anchorDay, setAnchorDay] = useState(initialDay ?? "2026-09-16");
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  return (
    <div className="flex h-[48rem]">
      <AdminScheduleCalendar
        className="flex-1"
        sessions={sessions ?? adminSessions}
        todayYmd="2026-09-16"
        anchorDay={anchorDay}
        selectedDay={openDay}
        selectedSessionId={selectedSessionId}
        view={view}
        onNavigate={setAnchorDay}
        onOpenDay={(ymd) => {
          setOpenDay(ymd);
          setSelectedSessionId(null);
        }}
        onOpenSession={(session) => {
          setOpenDay(session.startsAt.slice(0, 10));
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
