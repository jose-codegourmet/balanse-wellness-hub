import { paymentAccountFixtures } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentAccountFormDialog } from "./PaymentAccountFormDialog";
import { paymentAccountFormDefaultValues } from "./PaymentAccountFormDialog.defaults";
import { paymentAccountFormSchema } from "./PaymentAccountFormDialog.schema";

const [gcash, maya, qrph] = paymentAccountFixtures;

const meta = {
  title: "Admin/Components/PaymentAccountFormDialog",
  component: PaymentAccountFormDialog,
  args: { open: true, onOpenChange: () => {}, account: null },
  parameters: { paymentAccountFormSchema, paymentAccountFormDefaultValues },
} satisfies Meta<typeof PaymentAccountFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New account: GCash by default. Switch the type to see Maya and QR Ph rules. */
export const Add: Story = {};
export const EditGcash: Story = { args: { account: gcash } };
export const EditMayaNumberOnly: Story = { args: { account: maya } };
export const EditQrPh: Story = { args: { account: qrph } };
