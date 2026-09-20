import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Ban, CircleCheck, Info, Minus, Sparkles, TriangleAlert } from "lucide-react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/Table";
import { Badge } from "./Badge";
import { badgeDefaultValues } from "./Badge.defaults";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { ...badgeDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

const variants = ["neutral", "info", "success", "warning", "danger", "accent"] as const;
const appearances = ["solid", "soft"] as const;
const sizes = ["sm", "md"] as const;

const variantIcons = {
  neutral: <Minus aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  success: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <Ban aria-hidden="true" />,
  accent: <Sparkles aria-hidden="true" />,
} as const;

export const Default: Story = {};

export const VariantAppearanceMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">Size {size}</p>
          <div className="grid grid-cols-[auto_repeat(6,minmax(0,1fr))] items-center gap-2">
            <span />
            {variants.map((variant) => (
              <span key={variant} className="text-xs text-muted-foreground">
                {variant}
              </span>
            ))}
            {appearances.map((appearance) => (
              <div key={appearance} className="contents">
                <span className="text-xs text-muted-foreground">{appearance}</span>
                {variants.map((variant) => (
                  <Badge
                    key={`${size}-${appearance}-${variant}`}
                    variant={variant}
                    appearance={appearance}
                    size={size}
                  >
                    {variant}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const DotAndIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Label only</Badge>
        <Badge dot>With dot</Badge>
        <Badge icon={<CircleCheck aria-hidden="true" />}>With icon</Badge>
        <Badge dot icon={<CircleCheck aria-hidden="true" />}>
          Dot and icon
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge appearance="solid" variant="success">
          Label only
        </Badge>
        <Badge appearance="solid" variant="success" dot>
          With dot
        </Badge>
        <Badge appearance="solid" variant="success" icon={<CircleCheck aria-hidden="true" />}>
          With icon
        </Badge>
        <Badge appearance="solid" variant="success" dot icon={<CircleCheck aria-hidden="true" />}>
          Dot and icon
        </Badge>
      </div>
    </div>
  ),
};

export const DenseTableRow: Story = {
  render: () => (
    <Table>
      <TableCaption className="sr-only">Dense booking table with status badges</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Guest</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Amara Santos</TableCell>
          <TableCell>Sunrise Flow</TableCell>
          <TableCell>
            <Badge
              variant="success"
              appearance="solid"
              size="sm"
              icon={<CircleCheck aria-hidden="true" />}
            >
              Confirmed
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jonah Reid</TableCell>
          <TableCell>Deep Restore</TableCell>
          <TableCell>
            <Badge
              variant="warning"
              appearance="solid"
              size="sm"
              icon={<TriangleAlert aria-hidden="true" />}
            >
              Reserved — Payment Needed
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Leah Cruz</TableCell>
          <TableCell>Gold Hour Ride</TableCell>
          <TableCell>
            <Badge variant="info" appearance="solid" size="sm" icon={<Info aria-hidden="true" />}>
              Waitlisted
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Noah Patel</TableCell>
          <TableCell>Sound Bath</TableCell>
          <TableCell>
            <Badge variant="danger" appearance="solid" size="sm" icon={<Ban aria-hidden="true" />}>
              Not Confirmed
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const LongLabelOverflow: Story = {
  render: () => (
    <div className="flex max-w-56 flex-col items-start gap-2 p-4">
      <Badge variant="warning" appearance="soft" size="sm">
        Reserved — Payment Needed
      </Badge>
      <Badge variant="neutral" appearance="soft" size="sm">
        Reservation Expired
      </Badge>
    </div>
  ),
};

export const DarkTheme: Story = {
  decorators: [
    (StoryFn) => (
      <div className="dark bg-background p-6 text-foreground">
        <StoryFn />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-3">
      {appearances.map((appearance) => (
        <div key={appearance} className="flex flex-wrap items-center gap-2">
          {variants.map((variant) => (
            <Badge
              key={`${appearance}-${variant}`}
              variant={variant}
              appearance={appearance}
              size="sm"
            >
              {variant}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Greyscale: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4" style={{ filter: "grayscale(1)" }}>
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((variant) => (
          <Badge
            key={variant}
            variant={variant}
            appearance="solid"
            size="sm"
            icon={variantIcons[variant]}
          >
            {variant}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((variant) => (
          <Badge
            key={`${variant}-soft`}
            variant={variant}
            appearance="soft"
            size="sm"
            icon={variantIcons[variant]}
          >
            {variant}
          </Badge>
        ))}
      </div>
    </div>
  ),
};
