import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OnboardingStepDone } from "./OnboardingStepDone";

const meta = {
  title: "Portal/Onboarding/Done",
  component: OnboardingStepDone,
  tags: ["autodocs"],
  args: { displayName: "Annie", returnTo: "/portal", returnLabel: null },
} satisfies Meta<typeof OnboardingStepDone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed up from the portal or the home page: browse the schedule. */
export const WithoutSharedLink: Story = {};

/** Arrived from a shared session link: go back to it. */
export const FromSharedSession: Story = {
  args: {
    returnTo: "/sessions/reformer-pilates/2026-10-04/session-1?ref=ANADLG26",
    returnLabel: "Reformer Pilates",
  },
};

export const FromSharedEvent: Story = {
  args: {
    returnTo: "/events/pilates-for-a-cause/2026-10-18/event-1",
    returnLabel: "Pilates for a Cause",
  },
};
