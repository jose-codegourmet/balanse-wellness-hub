# Message — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Layout primitives for a single chat message row (avatar + content column, start/end alignment).

## When to use

- Incoming vs outgoing chat rows
- Avatar + bubble + timestamp/header footers

## When NOT to use

- Speech-bubble visual → nest **Bubble** inside `MessageContent`
- Scrollable chat pane → use **MessageScroller** instead

## Examples

### Incoming message

```tsx
<Message>
  <MessageAvatar>
    <Avatar className="size-8">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  </MessageAvatar>
  <MessageContent>
    <Bubble>
      <BubbleContent>Hello! How can I help you today?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

### Outgoing with header and footer

```tsx
<MessageGroup className="max-w-md">
  <Message align="end">
    <MessageAvatar>
      <Avatar className="size-8">
        <AvatarFallback>ME</AvatarFallback>
      </Avatar>
    </MessageAvatar>
    <MessageContent>
      <MessageHeader>You</MessageHeader>
      <Bubble align="end">
        <BubbleContent>Sounds good, thanks!</BubbleContent>
      </Bubble>
      <MessageFooter>2:34 PM</MessageFooter>
    </MessageContent>
  </Message>
</MessageGroup>
```

## Gotchas

- Presentational only; designed to nest Bubble and sit inside `MessageScrollerItem`
