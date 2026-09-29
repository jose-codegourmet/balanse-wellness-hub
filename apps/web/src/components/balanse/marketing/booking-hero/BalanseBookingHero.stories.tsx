import { publicClasses, publicCoaches, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BalanseBookingHero } from "./BalanseBookingHero";

const meta = {
  title: "Public/Booking hero",
  component: BalanseBookingHero,
  args: {
    sessions: publicSessions,
    classes: publicClasses,
    coaches: publicCoaches,
    loadError: false,
    classId: "all",
    coachId: "all",
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BalanseBookingHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Homepage: Story = {};
export const QuickBooking: Story = { args: { bookingMode: "quick" } };
export const Calendar: Story = { args: { bookingMode: "calendar" } };
export const FilteredCalendar: Story = {
  args: { bookingMode: "calendar", coachId: publicCoaches[0]?.id ?? "all" },
};
export const Empty: Story = { args: { bookingMode: "quick", sessions: [] } };
export const LoadFailed: Story = {
  args: { bookingMode: "calendar", loadError: true, sessions: [], classes: [] },
};
