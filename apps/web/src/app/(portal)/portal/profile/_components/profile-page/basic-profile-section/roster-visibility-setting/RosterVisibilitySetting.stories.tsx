import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RosterVisibilitySetting } from "./RosterVisibilitySetting";

const meta = {
  title: "Portal/RosterVisibilitySetting",
  component: RosterVisibilitySetting,
  tags: ["autodocs"],
  args: { checked: true, onChange: async () => null },
} satisfies Meta<typeof RosterVisibilitySetting>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shown: Story = {};
export const Hidden: Story = { args: { checked: false } };
/** The save fails, so the switch flips back and an error toast explains why. */
export const SaveFailsRollsBack: Story = {
  args: { onChange: async () => "The mock profile could not be saved." },
};
