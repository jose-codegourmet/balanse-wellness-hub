import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentReviewPage } from "./PaymentPages";

const meta = {
  title: "Admin/Screens/Payments",
  component: PaymentReviewPage,
  tags: ["autodocs"],
} satisfies Meta<typeof PaymentReviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GCashQueue: Story = {};

export const GCashEmpty: Story = {
  args: { empty: true, tab: "gcash" },
};

export const CounterQueue: Story = {
  args: { tab: "counter" },
};

export const CounterEmpty: Story = {
  args: { empty: true, tab: "counter" },
};

export const RefundsQueue: Story = {
  args: { tab: "refunds" },
};

export const RefundsEmpty: Story = {
  args: { empty: true, tab: "refunds" },
};

export const CardWithProof: Story = {
  args: { tab: "gcash" },
};

export const CardWithoutProof: Story = {
  args: { tab: "counter" },
};

export const ProofModalOpen: Story = {
  args: { tab: "gcash", proofOpen: true },
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
