import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassGallery } from "./ClassGallery";
import { classGalleryDefaultValues } from "./ClassGallery.defaults";

const meta = {
  title: "Public/Class gallery",
  component: ClassGallery,
  args: classGalleryDefaultValues,
} satisfies Meta<typeof ClassGallery>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const SingleImage: StoryObj<typeof meta> = {
  args: { images: classGalleryDefaultValues.images.slice(0, 1) },
};
export const Empty: StoryObj<typeof meta> = { args: { images: [] } };
