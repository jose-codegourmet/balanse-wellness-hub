import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./DataTable";

type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

const data: Person[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "Viewer" },
  { id: "4", name: "Dave Brown", email: "dave@example.com", role: "Editor" },
  { id: "5", name: "Eve Davis", email: "eve@example.com", role: "Viewer" },
];

const meta: Meta<typeof DataTable> = {
  title: "Components/Table/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  args: {
    columns,
    data,
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {};

export const WithFilter: Story = {
  args: {
    filterColumn: "name",
    filterPlaceholder: "Search by name...",
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
