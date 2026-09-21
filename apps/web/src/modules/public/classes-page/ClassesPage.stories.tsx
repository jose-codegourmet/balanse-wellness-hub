import { getMockAdapter } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassesPage } from "./ClassesPage";
import { classesPageDefaultValues } from "./ClassesPage.defaults";

const meta = {
  title: "Public/Classes",
  component: ClassesPage,
  args: classesPageDefaultValues,
} satisfies Meta<typeof ClassesPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Directory: Story = {
  loaders: [async () => ({ classes: await getMockAdapter().getPublicClasses() })],
  render: (args, { loaded }) => <ClassesPage {...args} classes={loaded.classes} />,
};
export const Empty: Story = {};
