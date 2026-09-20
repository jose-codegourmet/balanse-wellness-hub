import { CUSTOMER_STATUS_KEYS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table/Table";
import { StatusBadge, StatusBadgeCell } from "./StatusBadge";
import { statusBadgeDefaultValues } from "./StatusBadge.defaults";

const meta: Meta<typeof StatusBadge> = {
  title: "Shared/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: { ...statusBadgeDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllCustomerStatuses: Story = {
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

export const AllAdminStatuses: Story = {
  render: () => (
    <ul className="flex flex-col gap-2 p-4">
      {CUSTOMER_STATUS_KEYS.map((status) => (
        <li key={status}>
          <StatusBadge status={status} surface="admin" />
        </li>
      ))}
    </ul>
  ),
};

export const DenseTableRow: Story = {
  render: () => (
    <Table>
      <TableCaption className="sr-only">Admin booking statuses</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Guest</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {CUSTOMER_STATUS_KEYS.map((status) => (
          <TableRow key={status}>
            <StatusBadgeCell status={status} />
            <TableCell>Amara Santos</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const DarkTheme: Story = {
  decorators: [
    (StoryFn) => (
      <div className="dark bg-background p-6 text-foreground">
        <StoryFn />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {CUSTOMER_STATUS_KEYS.map((status) => (
          <StatusBadge key={`customer-${status}`} status={status} surface="customer" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CUSTOMER_STATUS_KEYS.map((status) => (
          <StatusBadge key={`admin-${status}`} status={status} surface="admin" />
        ))}
      </div>
    </div>
  ),
};
