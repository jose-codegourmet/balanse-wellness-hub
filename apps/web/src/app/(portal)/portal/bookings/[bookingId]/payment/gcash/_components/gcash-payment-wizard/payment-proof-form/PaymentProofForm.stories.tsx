import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentProofForm } from "./PaymentProofForm";

const meta: Meta<typeof PaymentProofForm> = {
  title: "Portal/Payment proof form",
  component: PaymentProofForm,
  tags: ["autodocs"],
  args: {
    amountLabel: "₱550.00",
    policies: [],
    submitting: false,
    onBack: () => undefined,
    onSubmit: () => undefined,
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPolicy: Story = {
  args: {
    policies: [
      {
        id: "policy-payment-proof-2026-01",
        documentName: "Payment proof terms",
        version: "2026-01",
        promotedAt: "",
        current: true,
        body: "Upload only your own receipt. The front desk checks every proof before confirming.",
      },
    ],
  },
};
export const Submitting: Story = { args: { submitting: true } };
