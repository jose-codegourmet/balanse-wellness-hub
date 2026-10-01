import { publicClasses } from "@balanse/mock";
import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { OnboardingStepInterests } from "./OnboardingStepInterests";
import { onboardingStepInterestsDefaultValues } from "./OnboardingStepInterests.defaults";

const active = publicClasses.filter((gymClass) => gymClass.active);

const meta = {
  title: "Portal/Onboarding/Step 3 · Interests",
  component: OnboardingStepInterests,
  tags: ["autodocs"],
  args: {
    classes: active,
    defaultValues: onboardingStepInterestsDefaultValues,
    onSubmit: () => undefined,
    footer: <Button type="submit">Continue</Button>,
  },
} satisfies Meta<typeof OnboardingStepInterests>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    defaultValues: {
      interestClassIds: active.slice(0, 2).map((gymClass) => gymClass.id),
      interestsOther: "",
    },
  },
};

export const OtherExpanded: Story = {
  args: {
    defaultValues: {
      interestClassIds: active.slice(0, 1).map((gymClass) => gymClass.id),
      interestsOther: "Aerial yoga",
    },
  },
};

/** Too-long "Other" text is the only way this optional step can fail. */
export const ValidationError: Story = {
  args: {
    defaultValues: { interestClassIds: [], interestsOther: "Aerial yoga ".repeat(12) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));
  },
};
