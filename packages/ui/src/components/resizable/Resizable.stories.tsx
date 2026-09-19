import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./Resizable";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: (args) => (
    <ResizablePanelGroup {...args} orientation="horizontal" className="max-w-md rounded-xl border">
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
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <ResizablePanelGroup {...args} orientation="vertical" className="max-w-md rounded-xl border">
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full min-h-[120px] items-center justify-center p-6">
          <span className="font-medium">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <div className="flex h-full min-h-[160px] items-center justify-center p-6">
          <span className="font-medium">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WithHandle: Story = {
  render: (args) => (
    <ResizablePanelGroup {...args} orientation="horizontal" className="max-w-md rounded-xl border">
      <ResizablePanel defaultSize={35}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-medium">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-medium">Main</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
