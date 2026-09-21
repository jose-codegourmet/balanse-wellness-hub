import type { PaymentQrCode } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PaymentQrPage } from "./PaymentQrPage";

const paymentQrOneDemo: PaymentQrCode[] = [
  {
    id: "pqr-main",
    label: "GCash — main",
    imageKey: "pending:gcash-main",
    isActive: true,
    createdAt: "2026-09-16T02:50:00.000Z",
    updatedAt: "2026-09-16T02:50:00.000Z",
    archivedAt: null,
  },
];
const paymentQrMultiDemo: PaymentQrCode[] = [
  ...paymentQrOneDemo,
  {
    id: "pqr-bank",
    label: "InstaPay — studio",
    imageKey: "pending:instapay",
    isActive: false,
    createdAt: "2026-09-16T02:50:00.000Z",
    updatedAt: "2026-09-16T02:50:00.000Z",
    archivedAt: null,
  },
];

const meta: Meta<typeof PaymentQrPage> = {
  title: "Admin/Screens/PaymentQr",
  component: PaymentQrPage,
  tags: ["autodocs"],
  args: { empty: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty360: Story = {
  args: { empty: true },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const OneQr768: Story = {
  args: { items: paymentQrOneDemo },
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const MultiQr1280: Story = {
  args: { items: paymentQrMultiDemo },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const Dark: Story = {
  args: { items: paymentQrMultiDemo },
  globals: { theme: "dark" },
};
