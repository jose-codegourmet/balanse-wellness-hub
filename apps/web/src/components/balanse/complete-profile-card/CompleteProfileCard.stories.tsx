import { onboardingCompletion } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CompleteProfileCard } from "./CompleteProfileCard";

const profile = { avatarUrl: null, nickname: null, lastName: "Delgado" };

const meta = {
  title: "Portal/CompleteProfileCard",
  component: CompleteProfileCard,
  tags: ["autodocs"],
  args: {
    status: "not_started",
    completion: onboardingCompletion(null, profile),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompleteProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Existing member who never saw the wizard (e.g. `cust-ana`). */
export const NotStarted: Story = {};

export const InProgress: Story = {
  args: {
    status: "in_progress",
    completion: onboardingCompletion(
      {
        goals: ["STRENGTH"],
        goalsOther: "",
        experienceLevel: "SOME",
        interestClassIds: [],
        interestsOther: "",
        heardFrom: null,
        heardFromOther: "",
        updatedAt: "2026-09-30T02:00:00.000Z",
      },
      { ...profile, nickname: "Annie" },
    ),
  },
};

/** Skipped on step 2: "1 of 4 done", resume lands on Goals. */
export const Skipped: Story = {
  args: {
    status: "skipped",
    completion: onboardingCompletion(null, { ...profile, nickname: "Annie" }),
  },
};
