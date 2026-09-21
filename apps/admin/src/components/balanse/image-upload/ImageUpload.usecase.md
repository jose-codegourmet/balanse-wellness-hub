# ImageUpload — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Admin wrapper around `MockImageUpload` for a single profile or proof image. Coach forms bind `photoKey` here so Upload / Replace / Remove all write one pending value.

## When to use

- Coach profile photo on the admin coach form
- Other admin mock image fields that already imported this wrapper (GCash QR)

## When NOT to use

- Public or customer surfaces — those use `apps/web` `ImageUpload` or `CoachPhoto` alone
- Real signed uploads — that is `BE-052`

## Examples

```tsx
<ImageUpload
  fallbackLabel="Crest fallback when no photo is saved."
  photoKey={photoKey}
  previewName={name}
  onPhotoKeyChange={setPhotoKey}
/>
```

## Gotchas

- Replace always mints a new `pending:` token. Do not coalesce with `??` against the previous key — that was a no-op when a photo already existed.
- Do not invent a storage key from the coach name. `pending:*` is a local mock marker; `CoachPhoto` shows the crest until `BE-052` mints a real key.
- `image-cropper` (1:1 / 4:5) is a follow-up, not part of this wrapper.
- Settings still pass `onMockSubmit` only — preview chrome stays off unless `photoKey` / `onPhotoKeyChange` are set.
