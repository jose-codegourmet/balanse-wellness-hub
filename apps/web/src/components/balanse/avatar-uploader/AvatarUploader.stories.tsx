import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AvatarUploader } from "./AvatarUploader";
import type { AvatarUploaderProps } from "./AvatarUploader.meta";

const SAMPLE_PHOTO = "/assets/marketing/classes/caliyoga-hero.webp";
const SAMPLE_AVATAR = "/assets/placeholders/avatars/avatar-02.svg";

/** Keeps the saved data URL in story state so Save / Remove visibly round-trip. */
function Interactive(props: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl);
  return (
    <AvatarUploader
      {...props}
      avatarUrl={avatarUrl}
      onSave={async (dataUrl) => {
        setAvatarUrl(dataUrl);
        return null;
      }}
      onRemove={async () => {
        setAvatarUrl(null);
        return null;
      }}
    />
  );
}

const meta = {
  title: "Portal/AvatarUploader",
  component: AvatarUploader,
  tags: ["autodocs"],
  args: {
    name: { firstName: "Ana", lastName: "Delgado" },
    avatarUrl: null,
    seed: "cust-ana",
    onSave: async () => null,
    onRemove: async () => null,
  },
  render: (args) => <Interactive {...args} />,
} satisfies Meta<typeof AvatarUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No photo yet: initials on the brand tone. */
export const NoPhoto: Story = {};

export const WithPhoto: Story = { args: { avatarUrl: SAMPLE_AVATAR } };

export const CropDialogOpen: Story = {
  args: { initialState: { kind: "crop", imageSrc: SAMPLE_PHOTO } },
};

export const ValidationErrorType: Story = {
  args: { initialState: { kind: "error", error: "type" } },
};

export const ValidationErrorSize: Story = {
  args: { initialState: { kind: "error", error: "size" } },
};

export const Uploading: Story = {
  args: { initialState: { kind: "saving", imageSrc: SAMPLE_PHOTO } },
};

export const RemoveConfirm: Story = {
  args: { avatarUrl: SAMPLE_AVATAR, initialState: { kind: "remove-confirm" } },
};

/** Save fails: the dialog stays open with the message and an error toast. */
export const SaveFails: Story = {
  args: { initialState: { kind: "crop", imageSrc: SAMPLE_PHOTO } },
  render: (args) => (
    <AvatarUploader {...args} onSave={async () => "The mock photo could not be saved."} />
  ),
};
