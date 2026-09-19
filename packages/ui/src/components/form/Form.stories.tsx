import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "../button/Button";
import { Input } from "../input/Input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./Form";

const meta: Meta<typeof Form> = {
  title: "Components/Form",
  component: Form,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

type ProfileValues = {
  displayName: string;
  email: string;
};

function ProfileFormDemo({
  defaultValues,
  triggerOnMount = false,
}: {
  defaultValues: ProfileValues;
  triggerOnMount?: boolean;
}) {
  const form = useForm<ProfileValues>({
    defaultValues,
    mode: "onSubmit",
  });

  React.useEffect(() => {
    if (triggerOnMount) {
      void form.trigger();
    }
  }, [form, triggerOnMount]);

  return (
    <Form {...form}>
      <form className="flex max-w-sm flex-col gap-4" onSubmit={form.handleSubmit(() => undefined)}>
        <FormField
          control={form.control}
          name="displayName"
          rules={{ required: "Display name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Alex Rivera" />
              </FormControl>
              <FormDescription>Shown on your public profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="you@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => (
    <ProfileFormDemo defaultValues={{ displayName: "Alex Rivera", email: "alex@example.com" }} />
  ),
};

export const WithValidation: Story = {
  render: () => (
    <ProfileFormDemo defaultValues={{ displayName: "", email: "not-an-email" }} triggerOnMount />
  ),
};

export const WithDescriptionOnly: Story = {
  render: () => {
    function DescriptionOnly() {
      const form = useForm({ defaultValues: { username: "balanse" } });
      return (
        <Form {...form}>
          <form className="max-w-sm">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Choose a unique username for your profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      );
    }
    return <DescriptionOnly />;
  },
};
