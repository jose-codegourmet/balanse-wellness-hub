import { Button, FeedbackState } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState } from "react";

import { AdminQueueCard } from "../admin-queue-card/AdminQueueCard";
import { AdminQueueList } from "./AdminQueueList";
import {
  type AdminQueueDemoItem,
  adminQueueListDefaultValues,
} from "./AdminQueueList.stories-data";

function makeItems(count: number): AdminQueueDemoItem[] {
  return Array.from({ length: count }, (_, index) => {
    const long = index % 7 === 0;
    return {
      id: `story-q-${index + 1}`,
      who: `Queue guest ${index + 1}`,
      what: index % 3 === 0 ? "Caliyoga · Sun 20 Sep" : "Yoga · Thu 17 Sep",
      when: `Requested 8:${String(index % 60).padStart(2, "0")} AM`,
      body: long
        ? "I need to travel for work this week and cannot make the class after all. Please release the slot so someone on the waitlist can take it."
        : "Needs review.",
      status:
        index % 3 === 0
          ? "PAYMENT_SUBMITTED"
          : index % 3 === 1
            ? "CANCELLATION_REQUESTED"
            : "RESCHEDULE_REQUESTED",
    };
  });
}

function renderDemoItem(item: AdminQueueDemoItem) {
  return (
    <AdminQueueCard
      who={item.who}
      what={item.what}
      when={item.when}
      status={item.status}
      emphasis
      body={
        <dl>
          <div>
            <dt className="text-muted-foreground">Note</dt>
            <dd>{item.body}</dd>
          </div>
        </dl>
      }
      actions={
        <Button type="button" size="sm" variant="outline">
          Review
        </Button>
      }
    />
  );
}

const meta: Meta<typeof AdminQueueList<AdminQueueDemoItem>> = {
  title: "Admin/Components/AdminQueueList",
  component: AdminQueueList,
  tags: ["autodocs"],
  args: {
    ...adminQueueListDefaultValues,
    renderItem: renderDemoItem,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FiveItems: Story = {};

export const Empty: Story = {
  args: {
    items: [],
    totalCount: 0,
  },
};

export const LoadingFirstPage: Story = {
  args: {
    items: [],
    loading: true,
  },
};

export const LoadingNextPage: Story = {
  args: {
    hasNextPage: true,
    isFetchingNextPage: true,
  },
};

export const ErrorOnNextPage: Story = {
  args: {
    hasNextPage: true,
    nextPageError: (
      <FeedbackState
        id="calendar.load-failed"
        title="Could not load more requests"
        description="The first page is still here. Try again without losing what you already reviewed."
        actionLabel="Retry"
        onAction={() => undefined}
      />
    ),
  },
};

export const VariableHeight: Story = {
  args: {
    items: makeItems(12),
    totalCount: 12,
  },
};

export const Virtualized140: Story = {
  args: {
    items: makeItems(140),
    totalCount: 140,
    hasNextPage: true,
  },
};

function LoadMoreDemo() {
  const all = useMemo(() => makeItems(60), []);
  const [count, setCount] = useState(20);
  const items = all.slice(0, count);
  return (
    <AdminQueueList
      label="Admin request queue"
      items={items}
      totalCount={all.length}
      getItemKey={(item) => item.id}
      renderItem={renderDemoItem}
      hasNextPage={count < all.length}
      fetchNextPage={() => setCount((value) => Math.min(all.length, value + 20))}
    />
  );
}

export const LoadMore: Story = {
  render: () => <LoadMoreDemo />,
};

export const Mobile360: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
