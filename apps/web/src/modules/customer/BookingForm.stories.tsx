import { currentPoliciesForForm } from "@balanse/domain";
import { adminSettings, customers, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingForm } from "./BookingForm";

const meta = {
  title: "Customer/BookingForm",
  component: BookingForm,
  args: {
    session:
      publicSessions.find((session) => session.id === "session-wed-open") ?? publicSessions[2],
    profile: customers[0],
    policies: currentPoliciesForForm(
      adminSettings.policyDocuments,
      adminSettings.policyFormRequirements,
      "booking",
    ),
  },
} satisfies Meta<typeof BookingForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prefill: Story = {};
export const Waitlist: Story = {
  args: {
    session:
      publicSessions.find((session) => session.id === "session-sat-full") ?? publicSessions[4],
    intent: "waitlist",
  },
};
/** No policies attached to the booking form in admin settings. */
export const WithoutPolicies: Story = { args: { policies: [] } };
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
