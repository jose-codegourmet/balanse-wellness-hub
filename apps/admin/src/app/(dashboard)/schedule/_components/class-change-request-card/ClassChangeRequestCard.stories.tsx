import { classChangeRequestFixtures } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassChangeRequestCard } from "./ClassChangeRequestCard";

const [reschedule, cancel, substitute] = classChangeRequestFixtures;

const meta = {
  title: "Admin/Components/ClassChangeRequestCard",
  component: ClassChangeRequestCard,
  args: { request: reschedule! },
} satisfies Meta<typeof ClassChangeRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingReschedule: Story = {};
export const ApprovedCancellation: Story = { args: { request: cancel! } };
export const DeniedSubstitute: Story = { args: { request: substitute! } };
