import { customers, policyAcceptances } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfilePage } from "./ProfilePage";

const meta = {
  title: "Customer/Profile",
  component: ProfilePage,
  args: {
    initialProfile: customers[0],
    initialAcceptances: policyAcceptances["cust-ana"],
  },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GooglePrincipal: Story = {};
export const EmailPrincipal: Story = {
  args: { initialProfile: customers[1], initialAcceptances: [] },
};
export const Saving: Story = { args: { forcedStatus: "saving" } };
export const Saved: Story = { args: { forcedStatus: "saved" } };
export const Failed: Story = { args: { forcedStatus: "failed" } };
