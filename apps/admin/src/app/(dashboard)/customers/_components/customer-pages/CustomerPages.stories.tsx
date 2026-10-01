import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerDetailPage } from "../customer-detail-page/CustomerDetailPage";
import { CustomerListPage } from "../customer-list-page/CustomerListPage";

const meta = {
  title: "Admin/Screens/Customers",
  component: CustomerListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CustomerListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full roster with derived stats; community members show avatars, nicknames, opt-outs, and onboarding status. */
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

/** Faceted Onboarding filter preset to "Skipped". */
export const OnboardingSkippedFilter: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { query: { customers_facets: "onboarding:Skipped" } },
    },
  },
};

/** Search matches nicknames ("Migs" → Jose Miguel Tan). */
export const NicknameSearch: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { query: { customers_q: "migs" } },
    },
  },
};

/** `cust-ana` has not started onboarding: About shows the empty state. */
export const Detail: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-ana" />,
};

/** Completed onboarding, referred by Ben (customer link), and referred two people. */
export const DetailCompleted: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-m-01" />,
};

/** Skipped onboarding with a partial answer. */
export const DetailSkipped: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-empty" />,
};

/** Not started onboarding (`cust-m-09`), no avatar, not referred. */
export const DetailNotStarted: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-m-09" />,
};

/** Opted out of the public roster: "Hidden on public roster" badge. */
export const DetailHiddenOnPublicRoster: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-m-04" />,
};

/** Studio QR sign-up without a referring customer. */
export const DetailStudioQr: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-m-02" />,
};

export const DetailNeverVisited: StoryObj<typeof CustomerDetailPage> = {
  render: () => <CustomerDetailPage customerId="cust-empty" />,
};
