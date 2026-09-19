# Attachment — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

File/media chip UI for uploads and attached files, including progress and error states.

## When to use

- Composer/file-picker attachment lists
- Upload progress and failed uploads with remove/retry

## When NOT to use

- Simple status tags → use **Badge** instead
- Full image galleries → use **Carousel** or **EmblaCarousel** instead

## Examples

### File chip with remove action

Default `orientation="horizontal"` puts media, content, and actions in a row.

```tsx
import { FileIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@balanse/ui";

<Attachment>
  <AttachmentMedia>
    <FileIcon />
  </AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>project-brief.pdf</AttachmentTitle>
    <AttachmentDescription>2.4 MB</AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction aria-label="Remove attachment">
      <XIcon />
    </AttachmentAction>
  </AttachmentActions>
</Attachment>;
```

### Grouped upload states

`state` styles the chip; group several chips with `AttachmentGroup`.

```tsx
import { AttachmentGroup } from "@balanse/ui";

<AttachmentGroup>
  <Attachment state="error">
    <AttachmentMedia>
      <FileIcon />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>failed-upload.docx</AttachmentTitle>
      <AttachmentDescription>Upload failed. Try again.</AttachmentDescription>
    </AttachmentContent>
  </Attachment>
  <Attachment size="sm" state="done">
    <AttachmentMedia>
      <FileIcon />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>notes.txt</AttachmentTitle>
      <AttachmentDescription>12 KB</AttachmentDescription>
    </AttachmentContent>
  </Attachment>
</AttachmentGroup>;
```

## Gotchas

- `state` is presentational only (exposed as `data-state`) — wire real upload logic yourself
- `AttachmentTrigger` is an absolute overlay for full-chip click targets
