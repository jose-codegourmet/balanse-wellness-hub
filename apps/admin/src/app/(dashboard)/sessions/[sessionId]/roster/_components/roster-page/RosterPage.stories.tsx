import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RosterPage } from "./RosterPage";

const meta = {
  title: "Admin/Screens/Roster",
  component: RosterPage,
  tags: ["autodocs"],
  args: { sessionId: "session-wed-open" },
} satisfies Meta<typeof RosterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New coverage — this module was not in the legacy AdminScreens hotspot. */
export const Default: Story = {};

export const CoachOwned: Story = {
  args: { sessionId: "session-wed-cutoff" },
  parameters: { staffId: "staff-ephraim" },
};

export const CoachCrossBoundary: Story = {
  args: { sessionId: "session-wed-open" },
  parameters: { staffId: "staff-ephraim" },
};
