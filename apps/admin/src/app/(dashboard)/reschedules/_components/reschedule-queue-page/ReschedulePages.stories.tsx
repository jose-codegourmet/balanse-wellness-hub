import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleQueuePage } from "./ReschedulePages";

const meta = {
  title: "Admin/Screens/Reschedules",
  component: RescheduleQueuePage,
  tags: ["autodocs"],
} satisfies Meta<typeof RescheduleQueuePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Queue: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

export const Approvable: Story = {
  args: { focus: "approvable" },
};

export const BlockedTargetFull: Story = {
  args: { focus: "blocked" },
};

export const CancelledTarget: Story = {
  args: { focus: "cancelled-target" },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadingNextPage: Story = {
  args: { fetchingNextPage: true },
};

export const LoadError: Story = {
  args: { error: true },
};

export const NextPageError: Story = {
  args: { nextPageError: true },
};

export const Dark: Story = {
  globals: { theme: "dark" },
};

export const Mobile360: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet768: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop1280: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
