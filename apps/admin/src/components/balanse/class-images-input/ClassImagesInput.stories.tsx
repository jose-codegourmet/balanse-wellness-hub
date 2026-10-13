import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ClassImagesInput } from "./ClassImagesInput";
import { classImagesInputDefaultValues } from "./ClassImagesInput.defaults";

const meta = {
  title: "Admin/Forms/Class images",
  component: ClassImagesInput,
  args: classImagesInputDefaultValues,
} satisfies Meta<typeof ClassImagesInput>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  render: function Story(args) {
    const [value, setValue] = useState(args.value);
    return <ClassImagesInput {...args} value={value} onChange={setValue} />;
  },
};

export const Cover: StoryObj<typeof meta> = {
  args: { multiple: false, value: ["/assets/marketing/classes/yoga-hero.webp"] },
  render: Default.render,
};
