import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PaymentQrPage } from "./PaymentQrPage";
import {
  paymentQrMultiDemo,
  paymentQrOneDemo,
  paymentQrPageDefaultValues,
} from "./PaymentQrPage.defaults";

const meta: Meta<typeof PaymentQrPage> = {
  title: "Admin/Screens/PaymentQr",
  component: PaymentQrPage,
  tags: ["autodocs"],
  args: { ...paymentQrPageDefaultValues },
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
