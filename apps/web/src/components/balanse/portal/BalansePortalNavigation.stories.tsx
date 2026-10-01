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
    account: {
      id: "cust-ana",
      fullName: "Ana Delgado",
      firstName: "Ana",
      lastName: "Delgado",
      email: "ana@example.com",
      avatarUrl: null,
    },
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

/** With a photo (#351): the avatar replaces the initials in the footer and mobile header. */
export const WithPhoto: Story = {
  args: {
    account: {
      id: "cust-ben",
      fullName: "Ben Santos",
      firstName: "Ben",
      lastName: "Santos",
      email: "ben@example.com",
      avatarUrl: "/assets/placeholders/avatars/avatar-02.svg",
    },
  },
};

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
