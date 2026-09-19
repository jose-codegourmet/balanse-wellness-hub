import { publicClasses, publicCoaches, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";

const meta = {
  title: "Customer/Schedule",
  component: ScheduleCalendarSection,
  args: {
    audience: "customer",
    initialSessions: publicSessions,
    initialClasses: publicClasses,
    initialCoaches: publicCoaches,
  },
} satisfies Meta<typeof ScheduleCalendarSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LoadFailed: Story = {
  args: { initialLoadError: true, initialSessions: [], initialClasses: [] },
};
