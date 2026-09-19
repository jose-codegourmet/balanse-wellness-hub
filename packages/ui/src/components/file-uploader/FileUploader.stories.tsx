import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { FileUploader, type FileUploaderProps } from "./FileUploader";

const PREVIEW_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect fill="#FF6B6B" width="128" height="128"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#17151F" font-size="14" font-family="sans-serif">preview</text></svg>`,
  );

const meta: Meta<typeof FileUploader> = {
  title: "Components/FileUploader",
  component: FileUploader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileUploader>;

function FileUploaderDemo({
  value: initialValue = null,
  onChange,
  onUpload,
  ...props
}: Partial<FileUploaderProps>) {
  const [value, setValue] = React.useState<string | null>(initialValue);

  return (
    <FileUploader
      className="max-w-sm"
      {...props}
      value={value}
      onChange={(url) => {
        setValue(url);
        onChange?.(url);
      }}
      onUpload={onUpload ?? (async (file) => URL.createObjectURL(file))}
    />
  );
}

export const Default: Story = {
  render: (args) => <FileUploaderDemo {...args} />,
};

export const WithPreview: Story = {
  render: (args) => <FileUploaderDemo {...args} value={PREVIEW_SRC} />,
};

export const Disabled: Story = {
  render: (args) => <FileUploaderDemo {...args} disabled />,
};

export const DisabledPreview: Story = {
  render: (args) => <FileUploaderDemo {...args} disabled value={PREVIEW_SRC} />,
};

export const UploadError: Story = {
  render: (args) => (
    <FileUploaderDemo
      {...args}
      onUpload={async () => {
        throw new Error("Upload failed. Try a smaller image.");
      }}
    />
  ),
};

export const SlowUpload: Story = {
  render: (args) => (
    <FileUploaderDemo
      {...args}
      onUpload={async (file) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        return URL.createObjectURL(file);
      }}
    />
  ),
};
