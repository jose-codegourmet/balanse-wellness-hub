import { getMockAdapter } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AboutPage } from "./AboutPage";
import { aboutPageDefaultValues } from "./AboutPage.defaults";

const meta = {
  title: "Marketing/About",
  component: AboutPage,
  tags: ["autodocs"],
  args: { ...aboutPageDefaultValues },
  loaders: [async () => ({ coaches: await getMockAdapter().getPublicCoaches() })],
  render: (args, { loaded }) => <AboutPage {...args} coaches={loaded.coaches} />,
} satisfies Meta<typeof AboutPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } };
