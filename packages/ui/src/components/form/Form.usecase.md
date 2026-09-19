# Form — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

react-hook-form helpers that wire labels, descriptions, and validation messages to a field.

## When to use

- Admin or app forms that already use `useForm` / `FormProvider`
- Accessible label + error association around Input/Select/FileUploader

## When NOT to use

- Layout-only label/error chrome without an RHF store → use **Field** instead
- A single standalone input with no form state → use **Label** + **Input**

## Examples

### Field with description and submit

Wrap the RHF instance in `Form` (`FormProvider`) and compose each control with `FormField`.

```tsx
import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@balanse/ui";

const form = useForm({ defaultValues: { displayName: "" } });

<Form {...form}>
  <form onSubmit={form.handleSubmit(() => undefined)}>
    <FormField
      control={form.control}
      name="displayName"
      rules={{ required: "Display name is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Display name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Shown on your public profile.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>;
```

### Validation message

`FormMessage` renders the RHF error when present; otherwise it renders `children`.

```tsx
<FormField
  control={form.control}
  name="email"
  rules={{ required: "Email is required" }}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} type="email" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Gotchas

- `"use client"`; `Form` is `FormProvider` — spread the `useForm()` return onto it
- `useFormField` throws unless it is used inside `FormField`
- `FormControl` is a `div` that owns `id` / `aria-*`; put the actual input inside it
