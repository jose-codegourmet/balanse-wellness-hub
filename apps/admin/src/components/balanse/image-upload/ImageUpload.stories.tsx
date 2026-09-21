import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { imageUploadDefaultValues } from "./ImageUpload.defaults";

const meta = {
  title: "Admin/Components/ImageUpload",
  component: ImageUpload,
  tags: ["autodocs"],
  args: {
    ...imageUploadDefaultValues,
  },
} satisfies Meta<typeof ImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UploadFailed: Story = {
  args: { forceFailure: true },
};

export const WithSavedPhoto: Story = {
  args: {
    label: "Replace Photo",
    photoKey: "coach-photos/rex",
    previewName: "Coach Rex",
  },
};

export const ReplaceOverwrites: Story = {
  render: function ReplaceOverwritesStory(args) {
    const [photoKey, setPhotoKey] = useState<string | null>("coach-photos/rex");
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Current key: <code>{photoKey ?? "null"}</code>
        </p>
        <ImageUpload
          {...args}
          photoKey={photoKey}
          previewName="Coach Rex"
          onPhotoKeyChange={setPhotoKey}
        />
      </div>
    );
  },
};

export const PendingLocalPreview: Story = {
  args: {
    photoKey: "pending:story",
    previewName: "New coach",
  },
};
