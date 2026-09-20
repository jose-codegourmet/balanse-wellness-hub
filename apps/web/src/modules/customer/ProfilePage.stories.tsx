import { customers, policyAcceptances } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfilePage } from "./ProfilePage";

/**
 * `/portal/profile` is a settings area with a submenu (FE-CUS-017). Every
 * story renders the same shell and picks a section, which is what the routes
 * under `/portal/profile/*` do. `customers[0]` is the Google principal
 * (`cust-ana`) and `customers[1]` signs in with email (`cust-ben`).
 */
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

const emailPrincipal = {
  initialProfile: customers[1],
  initialAcceptances: policyAcceptances["cust-ben"] ?? [],
};

export const BasicProfileGooglePrincipal: Story = { args: { section: "basic" } };
export const BasicProfileEmailPrincipal: Story = {
  args: { section: "basic", ...emailPrincipal },
};

export const AccountSettingsGooglePrincipal: Story = { args: { section: "account" } };
export const AccountSettingsEmailPrincipal: Story = {
  args: { section: "account", ...emailPrincipal },
};

/** Google holds the credential, so the fields stay reachable but disabled. */
export const PasswordSettingsGooglePrincipal: Story = { args: { section: "password" } };
export const PasswordSettingsEmailPrincipal: Story = {
  args: { section: "password", ...emailPrincipal },
};
export const PasswordSettingsSaved: Story = {
  args: { section: "password", forcedPasswordStatus: "saved", ...emailPrincipal },
};

export const PoliciesAndWaivers: Story = { args: { section: "policies" } };
export const PoliciesAndWaiversEmpty: Story = {
  args: { section: "policies", initialProfile: customers[1], initialAcceptances: [] },
};

export const Saving: Story = { args: { section: "basic", forcedStatus: "saving" } };
/** A successful save is announced by the portal toast — see `Portal/BalanseToaster`. */
export const Failed: Story = { args: { section: "basic", forcedStatus: "failed" } };
