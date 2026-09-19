# MessageScroller — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Chat-oriented scroll container with autoscroll, scroll anchors, and jump-to-end/start buttons.

## When to use

- Live chat / messaging threads that stick to the latest message
- Long conversations with a floating “scroll to end” control

## When NOT to use

- Generic scrollable panels → use **ScrollArea** instead

## Examples

### Basic chat viewport

```tsx
<MessageScrollerProvider>
  <MessageScroller className="h-72 w-full max-w-md rounded-xl border">
    <MessageScrollerViewport>
      <MessageScrollerContent>
        <MessageScrollerItem scrollAnchor>
          <Message align="start">
            <MessageContent>
              <Bubble align="start">
                <BubbleContent>Hey there!</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </MessageScrollerItem>
      </MessageScrollerContent>
    </MessageScrollerViewport>
  </MessageScroller>
</MessageScrollerProvider>
```

### With scroll-to-end button

```tsx
<MessageScrollerProvider>
  <MessageScroller className="h-72 w-full max-w-md rounded-xl border">
    <MessageScrollerViewport>
      <MessageScrollerContent>{/* MessageScrollerItems */}</MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>
```

## Gotchas

- `"use client"`; wrap with `MessageScrollerProvider`
- Root needs constrained height; mark the latest item with `scrollAnchor`
