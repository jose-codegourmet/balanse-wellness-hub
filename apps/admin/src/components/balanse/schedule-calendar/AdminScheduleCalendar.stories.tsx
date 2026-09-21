import { adminSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { AdminScheduleCalendar } from "./AdminScheduleCalendar";
import { adminScheduleCalendarDefaultValues } from "./AdminScheduleCalendar.defaults";
import type { AdminCalendarView } from "./AdminScheduleCalendar.schema";

function StatefulCalendar({
  view,
  selectedDay: initialDay,
  sessions,
}: {
  view: AdminCalendarView;
  selectedDay?: string;
  sessions?: typeof adminSessions;
}) {
  const [selectedDay, setSelectedDay] = useState(initialDay ?? "2026-09-16");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  return (
    <AdminScheduleCalendar
      sessions={sessions ?? adminSessions}
      todayYmd="2026-09-16"
      selectedDay={selectedDay}
      selectedSessionId={selectedSessionId}
      view={view}
      onSelectDay={setSelectedDay}
      onSelectSession={setSelectedSessionId}
      onCreateSession={() => undefined}
    />
  );
}

const meta: Meta<typeof AdminScheduleCalendar> = {
  title: "Admin/Components/AdminScheduleCalendar",
  component: AdminScheduleCalendar,
  tags: ["autodocs"],
  args: {
    ...adminScheduleCalendarDefaultValues,
    sessions: adminSessions,
    onSelectDay: () => undefined,
    onSelectSession: () => undefined,
    onCreateSession: () => undefined,
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
