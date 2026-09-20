import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerDetailPage, CustomerListPage } from "./CustomerPages";

const meta = {
  title: "Admin/Screens/Customers",
  component: CustomerListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const List: Story = {};

export const Detail: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-ana" />,
};
