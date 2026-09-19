# Resizable — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Split layouts with draggable separators between panels (`react-resizable-panels`).

## When to use

- Sidebar | main editor splits
- Vertical header/content splits

## When NOT to use

- Static grids that never resize
- Mobile drawer navigation → use **Sheet** / **Drawer** instead

## Examples

### Horizontal split

```tsx
<ResizablePanelGroup orientation="horizontal" className="max-w-md rounded-xl border">
  <ResizablePanel defaultSize={50}>
    <div className="flex h-[200px] items-center justify-center p-6">
      <span className="font-medium">Panel One</span>
    </div>
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>
    <div className="flex h-[200px] items-center justify-center p-6">
      <span className="font-medium">Panel Two</span>
    </div>
  </ResizablePanel>
</ResizablePanelGroup>
```

### Sidebar with visible handle

```tsx
<ResizablePanelGroup orientation="horizontal" className="max-w-md rounded-xl border">
  <ResizablePanel defaultSize={35}>
    <div className="flex h-[200px] items-center justify-center p-6">Sidebar</div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={65}>
    <div className="flex h-[200px] items-center justify-center p-6">Main</div>
  </ResizablePanel>
</ResizablePanelGroup>
```

## Gotchas

- `"use client"`; group should fill height (`h-full`); give panels sensible `defaultSize`s
