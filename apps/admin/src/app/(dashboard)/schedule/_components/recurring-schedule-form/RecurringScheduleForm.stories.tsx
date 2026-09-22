import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecurringScheduleForm } from "./RecurringScheduleForm";
import { recurringScheduleFormSchema } from "./RecurringScheduleForm.schema";

const meta = {
  title: "Admin/Screens/RecurringScheduleForm",
  component: RecurringScheduleForm,
  tags: ["autodocs"],
  args: { sessionId: "session-wed-open" },
  parameters: { recurringScheduleFormSchema },
} satisfies Meta<typeof RecurringScheduleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile" } } };
