import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BalansePortalLogout } from "./BalansePortalLogout";
import { BalansePortalNavigation } from "./BalansePortalNavigation";

/**
 * The portal sidebar owns the single logout entry point (FE-CUS-018). The same
 * block renders inside the mobile drawer, so the footer is sized for a 20rem
 * column as well as the 16.5rem sidebar.
 */
const meta = {
  title: "Portal/BalansePortalNavigation",
  component: BalansePortalNavigation,
  parameters: { layout: "fullscreen" },
  args: {
    account: { fullName: "Ana Delgado", email: "ana@example.com" },
  },
  decorators: [
    (Story) => (
      <div className="portal-shell">
        <Story />
        <div className="portal-workspace" />
      </div>
    ),
  ],
} satisfies Meta<typeof BalansePortalNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {};

/** Before the customer has a mock profile the footer drops to logout alone. */
export const WithoutAccount: Story = { args: { account: undefined } };

/**
 * The confirm dialog. "Stay signed in" is the safe default and keeps initial
 * focus; confirming clears the mock principal and hard-navigates to `/login`,
 * which leaves the Storybook canvas.
 */
export const LogoutConfirm: StoryObj<typeof BalansePortalLogout> = {
  render: () => (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-actions">
        <BalansePortalLogout initialOpen />
      </div>
    </aside>
  ),
};
