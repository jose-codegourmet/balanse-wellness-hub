import { adminSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassChangeSessionActions } from "./ClassChangeSessionActions";

const session = (id: string) => adminSessions.find((row) => row.id === id)!;

const meta = {
  title: "Admin/Components/ClassChangeSessionActions",
  component: ClassChangeSessionActions,
  args: { session: session("session-wed-cutoff"), canCancelDirectly: false },
  parameters: { staffId: "staff-ephraim" },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof ClassChangeSessionActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Coach on an upcoming class with no open request. */
export const CoachOptions: Story = {};

/** Coach whose request is waiting. */
export const CoachPending: Story = { args: { session: session("session-sat-groundworks") } };

/** Super Admin sees the waiting request and a Review link. */
export const ReviewerNotice: Story = {
  args: { session: session("session-sat-groundworks"), canCancelDirectly: true },
  parameters: { staffId: "staff-rex" },
};
