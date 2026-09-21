import { isPhMobile, PH_MOBILE_ERROR } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "../binding-story/BindingStory";
import { PhPhoneBinding } from "./PhPhoneBinding";

const schema = z.object({
  value: z.string().refine(isPhMobile, { message: PH_MOBILE_ERROR }),
});
const defaults = { value: "0917 000 0001" };

const meta = {
  title: "Admin/Components/Form/PhPhoneBinding",
  component: PhPhoneBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof PhPhoneBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Contact number">
      {(field) => <PhPhoneBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Contact number" invalid>
      {(field) => <PhPhoneBinding {...field} />}
    </BindingStory>
  ),
};
