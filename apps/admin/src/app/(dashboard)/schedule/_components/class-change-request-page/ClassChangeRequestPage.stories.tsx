import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassChangeRequestPage } from "./ClassChangeRequestPage";

const meta = {
  title: "Admin/Screens/ClassChangeRequest",
  component: ClassChangeRequestPage,
  tags: ["autodocs"],
  parameters: { staffId: "staff-ephraim" },
  args: { sessionId: "session-wed-cutoff" },
} satisfies Meta<typeof ClassChangeRequestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Coach starts a reschedule; an earlier denied substitute shows as history. */
export const Reschedule: Story = { args: { initialKind: "RESCHEDULE" } };

export const Substitute: Story = { args: { initialKind: "SUBSTITUTE" } };

/** Cancel is the last resort and warns about refunds. */
export const Cancel: Story = { args: { initialKind: "CANCEL" } };

/** A request is already waiting: status plus Withdraw, no new form. */
export const AwaitingApproval: Story = { args: { sessionId: "session-sat-groundworks" } };

/** A class the coach does not teach. */
export const NotAssigned: Story = { args: { sessionId: "session-sun-dance" } };
