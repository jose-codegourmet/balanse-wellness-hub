import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachListPage } from "./CoachListPage";

const meta = {
  title: "Admin/Screens/Coaches",
  component: CoachListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CoachListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All eleven fixture coaches — eight portraits, three ASSET-014 crests. */
export const FullRoster: Story = {};

export const WithPhoto: Story = {
  args: { focusCoachId: "coach-rex" },
};

export const CrestFallback: Story = {
  args: { focusCoachId: "coach-alec" },
};

export const Inactive: Story = {
  args: { focusCoachId: "coach-kate", forceInactive: true },
};

export const ManySpecialties: Story = {
  args: {
    focusCoachId: "coach-ephraim",
    extraSpecialties: ["Mobility", "Recovery"],
  },
};

export const Empty: Story = {
  args: { empty: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadFailed: Story = {
  args: { error: true },
};

/**
 * MockPrincipal has no staff role. Customer is the non-admin principal.
 * Rate must be absent from the DOM — not blanked.
 */
export const NonAdminStaff: Story = {
  globals: { principal: "customer" },
};
