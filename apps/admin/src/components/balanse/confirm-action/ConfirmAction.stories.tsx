import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmAction } from "./ConfirmAction";
import { confirmActionDefaultValues } from "./ConfirmAction.stories-data";

const meta: Meta<typeof ConfirmAction> = {
  title: "Admin/Components/ConfirmAction",
  component: ConfirmAction,
  tags: ["autodocs"],
  args: {
    ...confirmActionDefaultValues,
    onConfirm: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    triggerLabel: "Reject",
    title: "Reject this request?",
    description: "The customer stays on their current status.",
    variant: "destructive",
  },
};

export const RequiredReason: Story = {
  args: {
    triggerLabel: "Reject",
    title: "Reject this request?",
    description: "Tell the customer why this request cannot proceed.",
    confirmLabel: "Reject",
    variant: "destructive",
    requireReason: true,
    reasonPlaceholder: "Required — visible to the customer.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithDetails: Story = {
  args: {
    triggerLabel: "Approve payment",
    title: "Approve this GCash payment?",
    description: "The payment is marked verified and the booking is confirmed.",
    details: [
      { label: "Amount", value: "₱550.00" },
      { label: "Customer", value: "Jose Adrian Buctuanon" },
      { label: "Reference", value: "BAL-10234" },
    ],
    note: "This payment action is logged under Admin at 3:54 PM, Tue, Oct 13, 2026.",
  },
};
