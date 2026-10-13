import type { PublicSession } from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BalanseBookingCalendar } from "./BalanseBookingCalendar";

const meta = {
  title: "Marketing/Booking calendar",
  component: BalanseBookingCalendar,
  args: { sessions: [], classes: [], nowIso: MOCK_NOW_ISO },
  loaders: [
    async () => {
      const adapter = getMockAdapter();
      const [sessions, classes, coaches] = await Promise.all([
        adapter.getPublicSessions(),
        adapter.getPublicClasses(),
        adapter.getPublicCoaches(),
      ]);
      return { sessions, classes, coaches };
    },
  ],
  render: (args, { loaded }) => <BalanseBookingCalendar {...args} {...loaded} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BalanseBookingCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DesktopMonth: Story = { args: { view: "month" } };
export const TabletWeek: Story = { args: { view: "week" } };
export const MobileDay: Story = { args: { view: "day" } };
export const ManyCoaches: Story = {
  args: { view: "day" },
  render: (args, { loaded }) => {
    const session = (loaded.sessions as PublicSession[]).find((item) => item.reservable);
    return (
      <BalanseBookingCalendar
        {...args}
        {...loaded}
        nowIso={session?.startsAt ?? args.nowIso}
        sessions={session ? [{ ...session, coaches: loaded.coaches.slice(0, 6) }] : []}
      />
    );
  },
};
export const EmptyFilter: Story = { args: { view: "day", initialClassFilter: "class-bjj" } };
export const Loading: Story = { args: { loading: true } };
export const LoadFailed: Story = { args: { loadError: true } };
