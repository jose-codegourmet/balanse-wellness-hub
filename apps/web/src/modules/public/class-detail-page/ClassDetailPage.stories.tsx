import { getMockAdapter } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassDetailPage } from "./ClassDetailPage";
import { classDetailPageDefaultValues } from "./ClassDetailPage.defaults";

const meta = {
  title: "Public/Class detail",
  component: ClassDetailPage,
  args: classDetailPageDefaultValues,
} satisfies Meta<typeof ClassDetailPage>;
export default meta;
export const Yoga: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      const adapter = getMockAdapter();
      const [classes, coaches, sessions] = await Promise.all([
        adapter.getPublicClasses(),
        adapter.getPublicCoaches(),
        adapter.getPublicSessions(),
      ]);
      return { gymClass: classes[0], coaches, sessions };
    },
  ],
  render: (args, { loaded }) => <ClassDetailPage {...args} {...loaded} />,
};
export const Unavailable: StoryObj<typeof meta> = {};
