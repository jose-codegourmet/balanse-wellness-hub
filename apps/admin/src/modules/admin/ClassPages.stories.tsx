import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassFormPage, ClassListPage } from "./ClassPages";

const meta = {
  title: "Admin/Screens/Classes",
  component: ClassListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ClassListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

export const Form: StoryObj<typeof ClassFormPage> = {
  render: () => <ClassFormPage classId="class-yoga" />,
};
