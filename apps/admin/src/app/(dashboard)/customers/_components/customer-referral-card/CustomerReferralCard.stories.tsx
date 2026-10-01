import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerReferralCard } from "./CustomerReferralCard";

const meta = {
  title: "Admin/Customers/Customer referral card",
  component: CustomerReferralCard,
  tags: ["autodocs"],
  args: {
    referral: {
      referredBy: { id: "cust-ben", fullName: "Ben Santos" },
      channel: "CUSTOMER_LINK",
      referrals: [
        { id: "cust-m-05", fullName: "Bea Villanueva" },
        { id: "cust-m-08", fullName: "Andrea Lopez" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CustomerReferralCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Referred by a customer link and has referred two people. */
export const ReferredAndReferring: Story = {};

export const ReferredByQr: Story = {
  args: {
    referral: {
      referredBy: { id: "cust-m-01", fullName: "Maria Clara Reyes" },
      channel: "CUSTOMER_QR",
      referrals: [],
    },
  },
};

/** Studio marketing: a channel without a referring customer. */
export const StudioQr: Story = {
  args: { referral: { referredBy: null, channel: "STUDIO_QR", referrals: [] } },
};

export const NotReferred: Story = {
  args: { referral: { referredBy: null, channel: null, referrals: [] } },
};

export const NotReferredButReferring: Story = {
  args: {
    referral: {
      referredBy: null,
      channel: null,
      referrals: [{ id: "cust-m-01", fullName: "Maria Clara Reyes" }],
    },
  },
};
