import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormProvider, useForm } from "react-hook-form";
import { basicProfileFormDefaultValues } from "../profile-page/basic-profile-section/basic-profile-form/BasicProfileForm.defaults";
import {
  type BasicProfileIdentityValues,
  basicProfileIdentitySchema,
} from "../profile-page/basic-profile-section/basic-profile-form/BasicProfileForm.schema";
import { ProfileNameFields } from "./ProfileNameFields";

function Harness({
  values,
  avatarUrl,
}: {
  values: BasicProfileIdentityValues;
  avatarUrl: string | null;
}) {
  const form = useForm<BasicProfileIdentityValues>({
    resolver: zodResolver(basicProfileIdentitySchema),
    defaultValues: values,
  });
  return (
    <FormProvider {...form}>
      <form className="max-w-xl" onSubmit={form.handleSubmit(() => undefined)} noValidate>
        <ProfileNameFields avatarUrl={avatarUrl} seed="cust-ana" />
      </form>
    </FormProvider>
  );
}

const identity = (overrides: Partial<BasicProfileIdentityValues>): BasicProfileIdentityValues => ({
  firstName: basicProfileFormDefaultValues.firstName,
  lastName: basicProfileFormDefaultValues.lastName,
  nickname: basicProfileFormDefaultValues.nickname,
  ...overrides,
});

const meta = {
  title: "Portal/ProfileNameFields",
  component: Harness,
  tags: ["autodocs"],
  args: { values: identity({ firstName: "Ana", lastName: "Delgado" }), avatarUrl: null },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No nickname: other members see the first name. */
export const FirstNameOnly: Story = {};

export const WithNickname: Story = {
  args: {
    values: identity({ firstName: "Maria Clara", lastName: "Reyes", nickname: "Clara" }),
    avatarUrl: "/assets/placeholders/avatars/avatar-01.svg",
  },
};
