# `@balanse/ui` Public API

Documented public exports of `@balanse/ui`. Internal helpers are not listed here.

---

## Entry points

| Entry | Path | Stability |
|---|---|---|
| `@balanse/ui` | `src/index.ts` | Stable — barrel of all public components |
| `@balanse/ui/styles.css` | `src/styles.css` | Stable — global animation CSS |
| `@balanse/ui/*` | `src/components/*` | Experimental — subpath imports are not currently used by apps |

---

## Public components and utilities

Exported from `src/index.ts`:

| Category | Symbols |
|---|---|
| Accordion | `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` |
| Alert | `Alert`, `AlertAction`, `AlertDescription`, `AlertTitle` |
| Alert Dialog | `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogMedia`, `AlertDialogOverlay`, `AlertDialogPortal`, `AlertDialogTitle`, `AlertDialogTrigger` |
| Aspect Ratio | `AspectRatio` |
| Attachment | `Attachment`, `AttachmentAction`, `AttachmentActions`, `AttachmentContent`, `AttachmentDescription`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentTitle`, `AttachmentTrigger` |
| Avatar | `Avatar`, `AvatarBadge`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarImage` |
| Badge | `Badge`, `badgeVariants` |
| Breadcrumb | `Breadcrumb`, `BreadcrumbEllipsis`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| Bubble | `Bubble`, `BubbleContent`, `BubbleGroup`, `BubbleReactions` |
| Button | `Button`, `buttonVariants` |
| Button Group | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants` |
| Calendar | `Calendar`, `CalendarDayButton` |
| Card | `Card`, `CardAction`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle` |
| Carousel | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious`, `CarouselApi` (type), `useCarousel` |
| Chart | `ChartConfig` (type), `ChartContainer`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `ChartTooltip`, `ChartTooltipContent` |
| Checkbox | `Checkbox`, `CheckboxGroup`, `CheckboxGroupItem` |
| Collapsible | `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` |
| Combobox | `Combobox`, `ComboboxChip`, `ComboboxChips`, `ComboboxChipsInput`, `ComboboxCollection`, `ComboboxContent`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxInput`, `ComboboxItem`, `ComboboxLabel`, `ComboboxList`, `ComboboxSeparator`, `ComboboxTrigger`, `ComboboxValue`, `useComboboxAnchor` |
| Command | `Command`, `CommandDialog`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList`, `CommandSeparator`, `CommandShortcut` |
| Context Menu | `ContextMenu`, `ContextMenuCheckboxItem`, `ContextMenuContent`, `ContextMenuGroup`, `ContextMenuItem`, `ContextMenuLabel`, `ContextMenuPortal`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuTrigger` |
| Dialog | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` |
| Direction | `DirectionProvider`, `useDirection` |
| Drawer | `Drawer`, `DrawerClose`, `DrawerContent`, `DrawerDescription`, `DrawerFooter`, `DrawerHeader`, `DrawerOverlay`, `DrawerPortal`, `DrawerSwipeHandle`, `DrawerTitle`, `DrawerTrigger` |
| Dropdown Menu | `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuPortal`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger` |
| Embla Carousel | `EmblaCarousel`, `EmblaCarouselContent`, `EmblaCarouselDots`, `EmblaCarouselNext`, `EmblaCarouselPrev`, `EmblaCarouselSlide`, `EmblaCarouselApi` (type), `EmblaCarouselVariant` (type), `useEmblaCarouselContext` |
| Empty | `Empty`, `EmptyContent`, `EmptyDescription`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle` |
| Field | `Field`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldTitle` |
| File Uploader | `FileUploader`, `FileUploaderProps` (type) |
| Form | `Form`, `FormControl`, `FormDescription`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`, `useFormField` |
| Hover Card | `HoverCard`, `HoverCardContent`, `HoverCardTrigger` |
| Input | `Input` |
| Password Input | `PasswordInput` |
| PH Phone Input | `PhPhoneInput` |
| Input Group | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupInput`, `InputGroupText`, `InputGroupTextarea` |
| Input OTP | `InputOTP`, `InputOTPGroup`, `InputOTPSeparator`, `InputOTPSlot` |
| Item | `Item`, `ItemActions`, `ItemContent`, `ItemDescription`, `ItemFooter`, `ItemGroup`, `ItemHeader`, `ItemMedia`, `ItemSeparator`, `ItemTitle` |
| Kbd | `Kbd`, `KbdGroup` |
| Label | `Label` |
| Marker | `Marker`, `MarkerContent`, `MarkerIcon`, `markerVariants` |
| Menubar | `Menubar`, `MenubarCheckboxItem`, `MenubarContent`, `MenubarGroup`, `MenubarItem`, `MenubarLabel`, `MenubarMenu`, `MenubarPortal`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSeparator`, `MenubarShortcut`, `MenubarSub`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarTrigger` |
| Message | `Message`, `MessageAvatar`, `MessageContent`, `MessageFooter`, `MessageGroup`, `MessageHeader` |
| Message Scroller | `MessageScroller`, `MessageScrollerButton`, `MessageScrollerContent`, `MessageScrollerItem`, `MessageScrollerProvider`, `MessageScrollerViewport`, `useMessageScroller`, `useMessageScrollerScrollable`, `useMessageScrollerVisibility` |
| Motion | `ScrollReveal` |
| Native Select | `NativeSelect`, `NativeSelectOptGroup`, `NativeSelectOption` |
| Navigation Menu | `NavigationMenu`, `NavigationMenuContent`, `NavigationMenuIndicator`, `NavigationMenuItem`, `NavigationMenuLink`, `NavigationMenuList`, `NavigationMenuPositioner`, `NavigationMenuTrigger`, `navigationMenuTriggerStyle` |
| Pagination | `Pagination`, `PaginationContent`, `PaginationEllipsis`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` |
| Popover | `Popover`, `PopoverContent`, `PopoverDescription`, `PopoverHeader`, `PopoverTitle`, `PopoverTrigger` |
| Progress | `Progress`, `ProgressIndicator`, `ProgressLabel`, `ProgressTrack`, `ProgressValue` |
| Radio Group | `RadioGroup`, `RadioGroupItem` |
| Resizable | `ResizableHandle`, `ResizablePanel`, `ResizablePanelGroup` |
| Scroll Area | `ScrollArea`, `ScrollBar` |
| Select | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` |
| Separator | `Separator` |
| Sheet | `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetHeader`, `SheetTitle`, `SheetTrigger` |
| Skeleton | `Skeleton` |
| Slider | `Slider` |
| Sonner | `Toaster` |
| Spinner | `Spinner` |
| Switch | `Switch` |
| Table | `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow` |
| Data Table | `DataTable` |
| Tabs | `Tabs`, `TabsCarouselList`, `TabsContent`, `TabsList`, `TabsTrigger`, `tabsListVariants`, `TabsCarouselBreakpoint` (type), `TabsCarouselItem` (type) |
| Textarea | `Textarea` |
| Toggle | `Toggle`, `toggleVariants` |
| Toggle Group | `ToggleGroup`, `ToggleGroupItem` |
| Tooltip | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` |
| Option row | `OptionRow`, `choiceOptionFilterText`, `ChoiceOption` (type), `OptionRowProps` (type) |
| Control surface | `controlSurfaceVariants`, `textareaSurfaceVariants`, `controlSurfaceGroup`, `controlSurfaceChips`, `controlIndicatorStates` |
| Utilities | `cn` |
| Viewport hooks | `useMediaQuery`, `useBreakpoint`, `useMinWidth`, `useIsMobile` |
| Calendar | `ScheduleCalendar`, `detectView` |
| Mock harness | `MockHarnessAffordance` |
| Share kit | `ShareButton`, `ShareDialog`, `ShareButtonProps` (type), `ShareDialogProps` (type), `ShareContentProps` (type), `ShareDialogLayout` (type), `ShareNotification` (type), `ShareNotifier` (type) |
| QR helpers (server-safe) | `createQrMatrix`, `qrSvgPath`, `qrViewBoxSize`, `withQrVia`, `QR_QUIET_ZONE`, `QrMatrix` (type) |
| User avatar | `UserAvatar`, `UserAvatarStack`, `UserAvatarProps` (type), `UserAvatarSize` (type), `UserAvatarStackPerson` (type), `UserAvatarStackProps` (type) |

---

## Stability and breaking changes

- The barrel export (`@balanse/ui`) is the stable public API.
- Subpath exports (`@balanse/ui/*`) are available but not used by apps today. Treat them as experimental.
- Removing or renaming a barrel export is a breaking change for both apps. Update all consumers and their docs if you change a public API.

---

## When to use which component

For usage guidance, see `docs/component-guide.md`. It contains a per-component decision tree and "when to use / when not to use" notes.

### PublicNav booking visibility

`mobileCtaVisible?: boolean` (default `true`) controls the booking link below the desktop breakpoint. `mobileCtaOnly?: boolean` (default `false`) hides that link on desktop. The web app observes its booking section and supplies these presentation props; observation and route logic remain app-owned. Public navigation collapses below 1024px so the complete desktop menu fits without overflow.

`ScheduleCalendar` exposes `data-calendar-controls`, `data-calendar-grid="day|week|month"`, and `data-calendar-sessions` for scoped app presentation. The web marketing page uses these hooks to position session details beside the month calendar without changing portal layout or booking rules.

### Share kit (`share-dialog/`, #347)

`ShareButton` is the default entry point: it renders the trigger and owns open state. `ShareDialog` is the same surface, controlled (`open`, `onOpenChange`), for entry points you do not own as a button (dropdown row actions). Both take `{ url, title, subtitle?, posterUrl?, fileSlug, onCopied?, notify? }`; `ShareButton` adds `label`, `aria-label`, `iconOnly`, `variant`, `size`, `className`, `disabledReason`, `defaultOpen`, `layout`, `icon`.

- `url` is final (built with `withShareParams` from `@balanse/domain`). The QR encodes `url` + `via=qr`.
- Desktop renders `Dialog`; below 768px renders `Drawer` (`layout="auto"`). Force with `layout="dialog" | "drawer"`.
- `disabledReason` keeps the trigger focusable (`aria-disabled`) and shows the reason in a tooltip.
- **Toasts:** both apps mount the Jabkit toaster, not Sonner. Pass `notify={(n) => notify[n.tone]({ title: n.title, description: n.description })}` from the app's `notify` module. Without it, messages go to Sonner `toast`.
- Downloads: QR PNG 1024×1024 `balanse-<fileSlug>-qr.png`; poster `balanse-<fileSlug>-poster.png` (fetched from `posterUrl`, e.g. `/share/poster/sessions/<id>`).
- `QrMatrix.ts` has no `"use client"`, so server code (the `apps/web` `next/og` poster renderer) imports `createQrMatrix` / `qrSvgPath` from the barrel to draw the same QR.

### UserAvatar (`user-avatar/`, #346)

`UserAvatar` shows the photo when `avatarUrl` loads, otherwise initials on a deterministic brand tone (`seed`); `placeholder` renders an anonymous dashed circle. Sizes: `sm`, `default`, `lg`, `xl`. `UserAvatarStack` overlaps up to `max` (default 5) people, then "+N" (`overflowCount` adds hidden people; `placeholderCount` appends anonymous circles for the signed-out teaser). Never pass a last name on public surfaces: use `nameFromInitials(row.initials)` from `@balanse/domain` as `name` and `row.displayName` as `label`. Coaches keep `CoachAvatar` / coach photo helpers. Full contract: `src/components/user-avatar/UserAvatar.meta.ts`.
