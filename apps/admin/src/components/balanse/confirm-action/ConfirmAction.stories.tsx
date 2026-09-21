import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmAction } from "./ConfirmAction";
import { confirmActionDefaultValues } from "./ConfirmAction.defaults";

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
