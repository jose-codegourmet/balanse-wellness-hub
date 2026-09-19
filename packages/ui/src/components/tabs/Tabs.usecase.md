# Tabs — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Tabbed panels via Base UI Tabs, plus optional Embla-based `TabsCarouselList` for overflow on small containers.

## When to use

- Settings/content sections (account/password)
- Many tabs that overflow → `TabsCarouselList`

## When NOT to use

- In-page routing → use App Router / `Link` instead
- Mutually exclusive toolbar modes without panels → use **ToggleGroup** instead

## Examples

### Default tabs

```tsx
<Tabs defaultValue="account" className="max-w-md">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p className="text-sm text-muted-foreground">Make changes to your account settings here.</p>
  </TabsContent>
  <TabsContent value="password">
    <p className="text-sm text-muted-foreground">Change your password here.</p>
  </TabsContent>
</Tabs>
```

### Line variant

```tsx
<Tabs defaultValue="overview" className="max-w-md">
  <TabsList variant="line">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">{/* … */}</TabsContent>
</Tabs>
```

## Gotchas

- `"use client"`; `TabsCarouselList` depends on `embla-carousel-react` and container queries.
