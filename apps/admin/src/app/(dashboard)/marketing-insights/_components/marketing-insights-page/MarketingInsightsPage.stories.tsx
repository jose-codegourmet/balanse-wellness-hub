import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { MarketingInsightsPage, MarketingInsightsPageSkeleton } from "./MarketingInsightsPage";

const meta = {
  title: "Admin/Screens/Marketing insights",
  component: MarketingInsightsPage,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/marketing-insights" } } },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Story />
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof MarketingInsightsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Super Admin, last 90 days of community sign-ups (fixture `cust-m-01..12`). */
export const Populated: Story = {};

/** A window with no sign-ups: every card shows "No sign-ups in this range". */
export const EmptyRange: Story = {
  args: { initialRange: { from: "2030-01-01", to: "2030-01-31" } },
};

/** Front Desk lacks `reports.marketing.read`: the shared no-access state. */
export const NoPermission: Story = { parameters: { staffId: "staff-partner" } };

export const CoachNoPermission: Story = { parameters: { staffId: "staff-ephraim" } };

export const Loading: Story = {
  render: () => <MarketingInsightsPageSkeleton />,
};

export const Mobile: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
