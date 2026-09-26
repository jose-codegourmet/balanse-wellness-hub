import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventListPage } from "./EventListPage";

const meta = {
  title: "Admin/Screens/Events",
  component: EventListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof EventListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

export const FilteredToZero: Story = {
  args: { initialStatus: "ARCHIVED" },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadFailed: Story = {
  args: { error: true },
};
