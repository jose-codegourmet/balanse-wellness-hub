import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentProofDialog } from "./PaymentProofDialog";

const meta = {
  title: "Admin/Payments/PaymentProofDialog",
  component: PaymentProofDialog,
  args: { url: "/assets/placeholders/coach-placeholder-1x1.svg", customerName: "Ana Santos" },
} satisfies Meta<typeof PaymentProofDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Thumbnail: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
