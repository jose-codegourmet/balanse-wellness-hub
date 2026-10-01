import { customers, publicClasses } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockCustomerSelfServiceActions } from "../../../profile/_lib/mock-customer-self-service";
import { OnboardingWizard } from "./OnboardingWizard";

const ana = customers[0];
const active = publicClasses.filter((gymClass) => gymClass.active);

/**
 * `/portal/welcome`. Stories run the real step flow against the in-browser
 * mock store (`mockCustomerSelfServiceActions`); the route passes server
 * actions instead. Skip and the Done CTAs navigate away from the canvas.
 */
const meta = {
  title: "Portal/Onboarding/Wizard",
  component: OnboardingWizard,
  parameters: { layout: "fullscreen" },
  args: {
    profile: ana,
    answers: null,
    classes: active,
    referralChannel: null,
    initialStep: "you",
    returnTo: "/portal",
    returnLabel: null,
    actions: mockCustomerSelfServiceActions(ana.id),
  },
} satisfies Meta<typeof OnboardingWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

/** Resumed after skipping on step 2: earlier answers kept. */
export const ResumeAtGoals: Story = {
  args: {
    initialStep: "goals",
    profile: { ...ana, nickname: "Annie", onboardingStatus: "skipped" },
  },
};

/** Arrived from a friend's shared session link. */
export const FromFriendsSharedLink: Story = {
  args: {
    initialStep: "heard-from",
    referralChannel: "CUSTOMER_LINK",
    returnTo: "/sessions/reformer-pilates/2026-10-04/session-1?ref=ANADLG26",
    returnLabel: "Reformer Pilates",
  },
};

export const Done: Story = {
  args: {
    initialStep: "done",
    profile: { ...ana, nickname: "Annie", onboardingStatus: "completed" },
    returnTo: "/sessions/reformer-pilates/2026-10-04/session-1",
    returnLabel: "Reformer Pilates",
  },
};
