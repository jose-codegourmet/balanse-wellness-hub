import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationQueuePage } from "./CancellationPages";

const meta = {
  title: "Admin/Screens/Cancellations",
  component: CancellationQueuePage,
  tags: ["autodocs"],
} satisfies Meta<typeof CancellationQueuePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Queue: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadingNextPage: Story = {
  args: { fetchingNextPage: true },
};

export const Error: Story = {
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
