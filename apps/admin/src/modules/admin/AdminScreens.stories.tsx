import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationQueuePage } from "./CancellationPages";
import { ClassListPage } from "./ClassPages";
import { CoachListPage } from "./CoachPages";
import { CustomerListPage } from "./CustomerPages";
import { DashboardPage } from "./DashboardPage";
import { PaymentReviewPage } from "./PaymentPages";
import { ReportsPage } from "./ReportsPage";
import { RescheduleQueuePage } from "./ReschedulePages";
import { ScheduleListPage } from "./SchedulePages";
import { SettingsPage } from "./SettingsPage";
import { StaffListPage } from "./StaffPages";

const meta = {
  title: "Admin/Screens",
  component: DashboardPage,
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};
export const StaffEmpty: StoryObj<typeof StaffListPage> = {
  render: () => <StaffListPage empty />,
};
export const CustomersEmpty: StoryObj<typeof CustomerListPage> = {
  render: () => <CustomerListPage empty />,
};
export const ScheduleEmpty: StoryObj<typeof ScheduleListPage> = {
  render: () => <ScheduleListPage empty />,
};
export const Classes: StoryObj<typeof ClassListPage> = {
  render: () => <ClassListPage />,
};
export const Coaches: StoryObj<typeof CoachListPage> = {
  render: () => <CoachListPage />,
};
export const PaymentsEmpty: StoryObj<typeof PaymentReviewPage> = {
  render: () => <PaymentReviewPage empty />,
};
export const CancellationsEmpty: StoryObj<typeof CancellationQueuePage> = {
  render: () => <CancellationQueuePage empty />,
};
export const ReschedulesEmpty: StoryObj<typeof RescheduleQueuePage> = {
  render: () => <RescheduleQueuePage empty />,
};
export const ReportsEmpty: StoryObj<typeof ReportsPage> = {
  render: () => <ReportsPage empty />,
};
export const Settings: StoryObj<typeof SettingsPage> = {
  render: () => <SettingsPage />,
};
