import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentStepper } from "./PaymentStepper";

const steps = [
  { id: "pay", label: "Send payment" },
  { id: "upload", label: "Upload receipt" },
  { id: "review", label: "Front desk confirms" },
] as const;

const meta = {
  title: "Portal/Payment stepper",
  component: PaymentStepper,
  args: { steps, current: "pay" },
} satisfies Meta<typeof PaymentStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendPayment: Story = {};
export const UploadReceipt: Story = { args: { current: "upload" } };
export const Review: Story = { args: { current: "review" } };
