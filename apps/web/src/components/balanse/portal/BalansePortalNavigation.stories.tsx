import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BalansePortalLogout } from "./BalansePortalLogout";
import { BalansePortalNavigation } from "./BalansePortalNavigation";

/**
 * Desktop: the account row opens a menu (Profile, Back to the studio, Log out).
 * The same footer stays stacked in the mobile drawer. Logout confirm is still
 * FE-CUS-018 — one dialog, opened from the menu or the drawer button.
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
