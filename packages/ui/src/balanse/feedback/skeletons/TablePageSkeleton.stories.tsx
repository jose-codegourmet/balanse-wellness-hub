import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table/Table";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";
import { TablePageSkeleton } from "./TablePageSkeleton";
import { tablePageSkeletonDefaultValues } from "./TablePageSkeleton.defaults";

const meta: Meta<typeof TablePageSkeleton> = {
  title: "Shared/TablePageSkeleton",
  component: TablePageSkeleton,
  tags: ["autodocs"],
  args: tablePageSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof TablePageSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <TablePageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <TablePageSkeleton {...args} rows={6} />
    </ShellStoryFrame>
  ),
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <TablePageSkeleton {...args} rows={8} />
    </ShellStoryFrame>
  ),
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <TablePageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <TablePageSkeleton {...args} rows={6} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <TablePageSkeleton {...args} rows={8} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <TablePageSkeleton {...args} />
    </ReducedMotionNote>
  ),
};

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <TablePageSkeleton {...args} rows={3} columns={4} />
      <section className="w-full text-foreground">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Classes
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Class catalog</h2>
          <p className="text-sm text-muted-foreground">Published offerings for the week.</p>
        </div>
        <hr className="my-5 h-px border-0 bg-border" />
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Class</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Reformer Flow</TableCell>
              <TableCell>Maris</TableCell>
              <TableCell>8</TableCell>
              <TableCell>Published</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tower Basics</TableCell>
              <TableCell>Alec</TableCell>
              <TableCell>6</TableCell>
              <TableCell>Draft</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Chair Strength</TableCell>
              <TableCell>Jodi</TableCell>
              <TableCell>8</TableCell>
              <TableCell>Published</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  ),
};
