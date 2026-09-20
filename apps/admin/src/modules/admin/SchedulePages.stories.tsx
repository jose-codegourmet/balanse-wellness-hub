import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScheduleListPage, SessionFormPage } from "./SchedulePages";

const meta = {
  title: "Admin/Screens/Schedule",
  component: ScheduleListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ScheduleListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const List: Story = {};

export const SessionForm: StoryObj<typeof SessionFormPage> = {
  render: () => <SessionFormPage sessionId="session-wed-open" />,
};
