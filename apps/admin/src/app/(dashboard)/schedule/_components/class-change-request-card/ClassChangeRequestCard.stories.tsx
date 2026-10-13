import { classChangeRequestFixtures } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassChangeRequestCard } from "./ClassChangeRequestCard";

/** The fixture list is ordered reschedule, cancellation, substitute. */
function fixture(index: number) {
  const request = classChangeRequestFixtures[index];
  if (!request) throw new Error(`classChangeRequestFixtures[${index}] is missing`);
  return request;
}

const meta = {
  title: "Admin/Components/ClassChangeRequestCard",
  component: ClassChangeRequestCard,
  args: { request: fixture(0) },
} satisfies Meta<typeof ClassChangeRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingReschedule: Story = {};
export const ApprovedCancellation: Story = { args: { request: fixture(1) } };
export const DeniedSubstitute: Story = { args: { request: fixture(2) } };
