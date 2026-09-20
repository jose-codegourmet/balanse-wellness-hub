import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassListPage } from "./ClassListPage";

const meta = {
  title: "Admin/Screens/Classes",
  component: ClassListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ClassListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default catalogue: priced classes plus Open Studio (null defaults, inactive, many coaches). */
export const Populated: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

/** Fixture `class-open-studio` is inactive. */
export const Inactive: Story = {};

/** Fixture `class-open-studio` has null duration and price (`—`). */
export const NoDefaults: Story = {};

/** Fixture `class-open-studio` is associated with every coach. */
export const ManyCoaches: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Error: Story = {
  args: { error: true },
};

export const SlowLoad: Story = {
  parameters: {
    mockRuntime: { latencyMs: 800 },
  },
};
