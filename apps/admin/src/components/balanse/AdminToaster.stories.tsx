import { ADMIN_TOAST_IDS } from "@balanse/domain";
import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ReactNode, useState } from "react";
import { notify } from "@/modules/notifications/notify";
import { AdminToaster } from "./AdminToaster";
import { adminToasterDefaultValues } from "./AdminToaster.defaults";

/**
 * `AdminToaster` is mounted once by `modules/providers/Providers`, which the
 * Storybook preview decorator also wraps every story in. These stories drive
 * that single surface through `notify` rather than rendering a second toaster.
 */
const meta = {
  title: "Admin/Components/AdminToaster",
  component: AdminToaster,
  tags: ["autodocs"],
  args: { ...adminToasterDefaultValues },
  parameters: { layout: "centered" },
} satisfies Meta<typeof AdminToaster>;

export default meta;

type Story = StoryObj<typeof meta>;

function Panel({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <div className="max-w-xl space-y-4 p-6">
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export const Success: Story = {
  name: "Tone — success",
  render: () => (
    <Panel hint="Success tone. The accent rail and icon both carry the tone.">
      <Button
        onClick={() =>
          notify.success({
            title: "Class saved",
            description: "The class list is updated.",
          })
        }
      >
        Success
      </Button>
    </Panel>
  ),
};

export const Info: Story = {
  name: "Tone — info",
  render: () => (
    <Panel hint="Info tone for in-progress studio work that is not a confirmation.">
      <Button
        variant="secondary"
        onClick={() =>
          notify.info({
            title: "Saved in this mock",
            description: "The list will refresh on the next load.",
          })
        }
      >
        Info
      </Button>
    </Panel>
  ),
};

export const Warning: Story = {
  name: "Tone — warning",
  render: () => (
    <Panel hint="Warning tone for recoverable caution.">
      <Button
        variant="secondary"
        onClick={() =>
          notify.warning({
            title: "Unsaved changes",
            description: "Leave this form and those edits are lost.",
          })
        }
      >
        Warning
      </Button>
    </Panel>
  ),
};

export const Error: Story = {
  name: "Tone — error",
  render: () => (
    <Panel hint="Error tone. Raised on mock failNext and validation failures.">
      <Button
        variant="destructive"
        onClick={() =>
          notify.error({
            title: "Class not saved",
            description: "Those changes could not be saved. Try again.",
          })
        }
      >
        Error
      </Button>
    </Panel>
  ),
};

export const Loading: Story = {
  name: "Tone — loading",
  render: () => {
    const [pendingId, setPendingId] = useState<string | null>(null);
    return (
      <Panel hint="Loading toasts never auto-dismiss. The caller closes them once the mock mutation settles.">
        <Button
          disabled={pendingId !== null}
          onClick={() =>
            setPendingId(
              notify.loading({
                title: "Saving class",
                description: "Hold on while the mock write settles.",
              }),
            )
          }
        >
          Start loading toast
        </Button>
        <Button
          variant="secondary"
          disabled={pendingId === null}
          onClick={() => {
            if (!pendingId) return;
            notify.dismiss(pendingId);
            setPendingId(null);
            notify.admin("class.saved");
          }}
        >
          Resolve it
        </Button>
      </Panel>
    );
  },
};

export const SnapshotViewport: Story = {
  name: "Snapshot — disablePortal",
  args: { disablePortal: true },
  render: (args) => (
    <div className="relative min-h-40 w-[28rem]">
      <AdminToaster {...args} />
      <Button onClick={() => notify.admin("class.saved")}>Raise admin copy</Button>
    </div>
  ),
};

export const Stacked: Story = {
  render: () => (
    <Panel hint="The viewport stacks up to three toasts. Copy comes from ADMIN_TOAST_IDS.">
      <Button
        onClick={() => {
          for (const id of ADMIN_TOAST_IDS) notify.admin(id);
        }}
      >
        Raise every admin message
      </Button>
      <Button variant="ghost" onClick={() => notify.dismiss()}>
        Dismiss all
      </Button>
    </Panel>
  ),
};
