import { computeAdminReports } from "@balanse/domain";
import { adminSessions, bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ReportsOverview } from "./ReportsOverview";

const seeded = computeAdminReports(adminSessions, bookings, {
  from: "2026-09-01",
  to: "2026-09-30",
});

function ReportsOverviewHarness() {
  const [range, setRange] = useState({ from: "2026-09-01", to: "2026-09-30" });
  return (
    <ReportsOverview reports={seeded} from={range.from} to={range.to} onRangeChange={setRange} />
  );
}

const meta = {
  title: "Admin/Components/ReportsOverview",
  component: ReportsOverview,
  tags: ["autodocs"],
  render: () => <ReportsOverviewHarness />,
} satisfies Meta<typeof ReportsOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptySeries: Story = {
  render: () => (
    <ReportsOverview
      reports={{
        ...seeded,
        sessionPerformance: [],
        classPerformance: [],
        coachCosts: [],
      }}
      from="2026-09-01"
      to="2026-09-30"
      onRangeChange={() => undefined}
    />
  ),
};
