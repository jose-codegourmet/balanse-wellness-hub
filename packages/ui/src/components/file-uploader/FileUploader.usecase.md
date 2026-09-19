# FileUploader — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Single-image dropzone that uploads a file and stores the resulting URL.

## When to use

- Cover images, avatars, and other one-file image fields in admin forms
- Pairing with **Form** via `value` / `onChange` from an RHF field

## When NOT to use

- Multi-file composer chips or presentational upload rows → use **Attachment** instead
- Non-image documents unless you override `accept` and accept that the preview is still an `<img>`

## Examples

### Empty dropzone

`onUpload` must return a URL string. The component calls `onChange` with that URL.

```tsx
import { FileUploader } from "@balanse/ui";

<FileUploader
  value={url}
  onChange={setUrl}
  onUpload={async (file) => {
    const uploaded = await uploadImage(file);
    return uploaded;
  }}
/>;
```

### Preview and clear

When `value` is set, the dropzone becomes a thumbnail with a remove button (`onChange(null)`).

```tsx
<FileUploader
  value="https://example.com/cover.jpg"
  onChange={setUrl}
  onUpload={uploadImage}
/>
```

### Form field

```tsx
<FormField
  control={form.control}
  name="coverImage"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Cover image</FormLabel>
      <FormControl>
        <FileUploader value={field.value} onChange={field.onChange} onUpload={uploadImage} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Gotchas

- `"use client"`; you own persistence — pass a real `onUpload` (admin uses `/api/images`)
- Rejected `onUpload` shows `error.message` or `"Upload failed"`
- Preview is always an `<img>`; clearing does not revoke object URLs you created
