import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerDetailPage } from "./CustomerDetailPage";
import { CustomerListPage } from "./CustomerListPage";

const meta = {
  title: "Admin/Screens/Customers",
  component: CustomerListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full roster with derived stats above the table. */
export const PopulatedWithStats: Story = {};

export const EmptyRoster: Story = {
  args: { empty: true },
};

/** Search query matches nobody — FeedbackState reset clears URL filters. */
export const FilteredToEmpty: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          customers_q: "zzz-no-match",
        },
      },
    },
  },
};

/** Fixture `cust-empty` has no bookings, so last visit is `—`. */
export const NeverVisited: Story = {
  args: { focusCustomerId: "cust-empty" },
};

/** Fixture `cust-ana` carries the status-matrix bookings, including several upcoming. */
export const ManyUpcoming: Story = {
  args: { focusCustomerId: "cust-ana" },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadError: Story = {
  args: { error: true },
};

export const SlowLoad: Story = {
  parameters: {
    mockRuntime: { latencyMs: 800 },
  },
};

export const Detail: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-ana" />,
};

export const DetailNeverVisited: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-empty" />,
};
