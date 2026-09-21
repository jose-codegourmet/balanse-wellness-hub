import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminQueueCard } from "./AdminQueueCard";
import { adminQueueCardDefaultValues } from "./AdminQueueCard.stories-data";

const meta: Meta<typeof AdminQueueCard> = {
  title: "Admin/Components/AdminQueueCard",
  component: AdminQueueCard,
  tags: ["autodocs"],
  args: {
    ...adminQueueCardDefaultValues,
    body: (
      <dl className="grid gap-2">
        <div>
          <dt className="text-muted-foreground">Method</dt>
          <dd>GCash</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Amount</dt>
          <dd>₱550</dd>
        </div>
      </dl>
    ),
    actions: (
      <>
        <Button type="button" size="sm">
          Confirm payment
        </Button>
        <Button type="button" size="sm" variant="outline">
          Reject
        </Button>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMedia: Story = {
  args: {
    media: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/assets/placeholders/coach-placeholder-1x1.svg"
        alt="GCash payment proof"
        className="rounded-lg border"
      />
    ),
  },
};

export const Quiet: Story = {
  args: { emphasis: false, status: "CONFIRMED" },
};

export const Mobile360: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
