import { CUSTOMER_STATUS_KEYS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge, StatusBadgeCell } from "./StatusBadge";

const meta = {
  title: "Shared/StatusBadge",
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomerBadges: Story = {
  args: { status: "HELD_AWAITING_PAYMENT", surface: "customer" },
  render: () => (
    <ul className="flex flex-col gap-2 p-4">
      {CUSTOMER_STATUS_KEYS.map((status) => (
        <li key={status}>
          <StatusBadge status={status} surface="customer" />
        </li>
      ))}
    </ul>
  ),
};

export const AdminTableCells: Story = {
  args: { status: "CONFIRMED", surface: "admin" },
  render: () => (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Admin booking statuses</caption>
      <thead>
        <tr>
          <th className="px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {CUSTOMER_STATUS_KEYS.map((status) => (
          <tr key={status} className="border-t border-border">
            <StatusBadgeCell status={status} />
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
