import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScheduleListPage } from "./ScheduleListPage";

const meta = {
  title: "Admin/Screens/Schedule",
  component: ScheduleListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ScheduleListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MonthWithSessions: Story = {};

export const EmptyMonth: Story = {
  args: { empty: true },
};

export const SelectedDayWithSessions: Story = {
  args: { selectedDay: "2026-09-16" },
};

export const SelectedEmptyDay: Story = {
  args: { selectedDay: "2026-09-21" },
};

export const Loading: Story = {
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const Dark: Story = {
  globals: { theme: "dark" },
};

export const WeekView: Story = {
  args: { view: "week", selectedDay: "2026-09-16" },
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const DayView: Story = {
  args: { view: "day", selectedDay: "2026-09-16" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};
