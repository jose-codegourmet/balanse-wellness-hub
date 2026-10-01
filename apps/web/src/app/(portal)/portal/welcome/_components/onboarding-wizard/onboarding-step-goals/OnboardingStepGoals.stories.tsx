import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { OnboardingStepGoals } from "./OnboardingStepGoals";
import { onboardingStepGoalsDefaultValues } from "./OnboardingStepGoals.defaults";

const meta = {
  title: "Portal/Onboarding/Step 2 · Goals",
  component: OnboardingStepGoals,
  tags: ["autodocs"],
  args: {
    defaultValues: onboardingStepGoalsDefaultValues,
    onSubmit: () => undefined,
    footer: <Button type="submit">Continue</Button>,
  },
} satisfies Meta<typeof OnboardingStepGoals>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    defaultValues: {
      goals: ["STRENGTH", "POSTURE_CORE"],
      goalsOther: "",
      experienceLevel: "SOME",
    },
  },
};

export const OtherExpanded: Story = {
  args: {
    defaultValues: {
      goals: ["STRESS_RELIEF", "OTHER"],
      goalsOther: "Train for a charity fun run",
      experienceLevel: "NEW",
    },
  },
};

/** Continue with nothing picked: both groups explain what is needed. */
export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));
  },
};
