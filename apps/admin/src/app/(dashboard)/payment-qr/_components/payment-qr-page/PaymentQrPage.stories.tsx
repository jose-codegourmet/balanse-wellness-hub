import type { PaymentQrCode } from "@balanse/domain";
import { paymentAccountFixtures } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PaymentQrPage } from "./PaymentQrPage";

const allHidden: PaymentQrCode[] = paymentAccountFixtures.map((row) => ({
  ...row,
  isActive: false,
}));

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

/** GCash (with QR) and Maya (number only) shown; a QR Ph account hidden. */
export const Accounts1280: Story = {
  args: { items: paymentAccountFixtures },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const Accounts768: Story = {
  args: { items: paymentAccountFixtures },
  parameters: { viewport: { defaultViewport: "tablet" } },
};

/** Every account hidden: customers see nothing, so the page warns. */
export const NoneShown: Story = { args: { items: allHidden } };

export const Dark: Story = {
  args: { items: paymentAccountFixtures },
  globals: { theme: "dark" },
};
