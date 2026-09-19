# NavigationMenu — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Site navigation with optional hover/click dropdown panels.

## When to use

- Top-of-site nav with plain links
- “Products” / “Resources” flyout panels

## When NOT to use

- App File/Edit menus → use **Menubar** instead
- Single button dropdown → use **DropdownMenu** instead
- Mobile hamburger → use **Sheet** / **Drawer** instead

## Examples

### Plain links

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="#">Home</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#">About</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#">Contact</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### With flyout

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent className="min-w-48 p-2">
        <ul className="grid gap-1">
          <li>
            <NavigationMenuLink href="#">Playdates</NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="#">Premium plans</NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Gotchas

- Root always mounts `NavigationMenuPositioner` as a sibling of children
