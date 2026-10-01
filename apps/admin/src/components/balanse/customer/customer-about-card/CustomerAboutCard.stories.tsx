import { type CustomerOnboardingAnswers, EMPTY_ONBOARDING_ANSWERS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerAboutCard, type CustomerAboutCardProps } from "./CustomerAboutCard";

const classes = {
  "class-pilates": { id: "class-pilates", name: "Pilates", active: true },
  "class-yoga": { id: "class-yoga", name: "Yoga Flow", active: true },
  "class-bjj": { id: "class-bjj", name: "Brazilian Jiu-Jitsu", active: false },
};

const completed: CustomerOnboardingAnswers = {
  ...EMPTY_ONBOARDING_ANSWERS,
  goals: ["FLEXIBILITY_MOBILITY", "POSTURE_CORE", "OTHER"],
  goalsOther: "Recover from a desk job",
  experienceLevel: "SOME",
  interestClassIds: ["class-pilates", "class-yoga", "class-bjj"],
  interestsOther: "Aerial yoga",
  heardFrom: "OTHER",
  heardFromOther: "Office wellness fair",
  updatedAt: "2026-08-03T01:00:00.000Z",
};

const linkToClass: CustomerAboutCardProps["classHref"] = (id) => `/classes/${id}`;

const meta = {
  title: "Admin/Components/Customer about card",
  component: CustomerAboutCard,
  tags: ["autodocs"],
  args: {
    onboarding: completed,
    onboardingStatus: "completed",
    classes,
    classHref: linkToClass,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CustomerAboutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Customer detail: every answer, including Other texts, an inactive class and heard-from. */
export const Completed: Story = {};

/** Skipped with partial answers: answers render with an "Onboarding skipped" note. */
export const SkippedPartial: Story = {
  args: {
    onboarding: { ...EMPTY_ONBOARDING_ANSWERS, goals: ["STRESS_RELIEF"] },
    onboardingStatus: "skipped",
  },
};

export const NotStarted: Story = {
  args: { onboarding: null, onboardingStatus: "not_started" },
};

export const Skipped: Story = {
  args: { onboarding: null, onboardingStatus: "skipped" },
};

/** Coach Students: no heard-from, class names as plain tags (no `classes.read`). */
export const CoachView: Story = {
  render: (args) => (
    <CustomerAboutCard
      {...args}
      classHref={null}
      showHeardFrom={false}
      onboardingStatus={undefined}
    />
  ),
};

/** Roster guest sheet: goals / experience chip row with an expandable Interests / Other. */
export const Compact: Story = {
  args: { variant: "compact" },
};

/** Compact renders nothing when the viewer has no answers access (`onboarding: null`). */
export const CompactWithoutAccess: Story = {
  args: { variant: "compact", onboarding: null },
};
