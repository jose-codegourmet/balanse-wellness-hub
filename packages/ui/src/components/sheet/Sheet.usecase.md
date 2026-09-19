# Sheet — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Slide-over panel (edge drawer) built on the Dialog primitive — overlay + optional close.

## When to use

- Side filters / edit forms
- Mobile/nav drawers from left or right

## When NOT to use

- Centered modal → use **Dialog** instead
- Swipe/snap mobile sheets → use **Drawer** instead
- Transient feedback → use **Sonner** instead

## Examples

### Right-side edit sheet

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Sheet title</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when done.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### Left nav / filters with footer

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="outline" />}>Filters</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Adjust your search preferences.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <Button>Apply filters</Button>
      <Button variant="outline">Reset</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Gotchas

- `"use client"`; left/right sheets are `w-3/4` with `sm:max-w-sm`.
