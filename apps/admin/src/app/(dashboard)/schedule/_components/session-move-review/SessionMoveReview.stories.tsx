import { adminSessions, MOCK_NOW_ISO } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionMoveReview } from "./SessionMoveReview";

const session =
  adminSessions.find(
    (row) => Date.parse(row.startsAt) > Date.parse(MOCK_NOW_ISO) && row.status === "PUBLISHED",
  ) ?? adminSessions[0];
const meta = {
  title: "Admin/Schedule/SessionMoveReview",
  component: SessionMoveReview,
  args: {
    move: {
      session,
      startsAt: new Date(Date.parse(session.startsAt) + 900000).toISOString(),
      endsAt: new Date(Date.parse(session.endsAt) + 900000).toISOString(),
    },
    sessions: adminSessions,
    onClose: () => {},
  },
} satisfies Meta<typeof SessionMoveReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewTimeChange: Story = {};
