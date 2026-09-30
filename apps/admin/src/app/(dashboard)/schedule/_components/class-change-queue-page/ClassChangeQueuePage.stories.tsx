import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassChangeQueuePage } from "./ClassChangeQueuePage";

const meta = {
  title: "Admin/Screens/ClassChangeRequests",
  component: ClassChangeQueuePage,
  tags: ["autodocs"],
  parameters: { staffId: "staff-rex" },
} satisfies Meta<typeof ClassChangeQueuePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Super Admin: one pending reschedule to approve or deny; resolved history on the other tab. */
export const Pending: Story = {};

export const Empty: Story = { args: { empty: true } };
