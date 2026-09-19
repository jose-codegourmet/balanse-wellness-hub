# Bubble — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Chat/message bubble with alignment, variants, and optional reaction overlays.

## When to use

- Messaging / AI chat transcripts (sent vs received)
- Error delivery states (`destructive`)
- Reaction piles

## When NOT to use

- Page-level system notices → use **Alert** instead
- Structured content cards → use **Card** instead

## Examples

### Received vs sent bubbles

`align="end"` flips the bubble to the outgoing side.

```tsx
import { Bubble, BubbleContent } from "@balanse/ui";

<Bubble>
  <BubbleContent>Hey! Are we still on for the playdate tomorrow?</BubbleContent>
</Bubble>
<Bubble align="end" variant="muted">
  <BubbleContent>Sounds great — see you at the park!</BubbleContent>
</Bubble>;
```

### Failed delivery

Use `variant="destructive"` for messages that could not be sent.

```tsx
<Bubble variant="destructive">
  <BubbleContent>Unable to deliver this message. Please try again.</BubbleContent>
</Bubble>
```

## Gotchas

- Default max width is ~80% (`ghost` is full width)
- Nest inside **Message** for the avatar + row layout
