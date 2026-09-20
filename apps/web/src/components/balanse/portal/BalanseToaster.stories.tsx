import { PORTAL_TOAST_IDS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/jabkit/button";
import { notify } from "@/modules/notifications/notify";
import { BalanseToaster } from "./BalanseToaster";

/**
 * `BalanseToaster` is mounted once by `modules/providers/Providers`, which the
 * Storybook preview decorator also wraps every story in. These stories drive
 * that single surface through `notify` rather than rendering a second toaster,
 * which would duplicate every toast into two viewports.
 */
const meta = {
  title: "Portal/BalanseToaster",
  component: BalanseToaster,
  parameters: { layout: "centered" },
} satisfies Meta<typeof BalanseToaster>;

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

export const Tones: Story = {
  name: "Tones — success / info / warning / error",
  render: () => (
    <Panel hint="One toast per tone. The accent rail and icon both carry the tone, so colour is never the only signal.">
      <Button
        onClick={() =>
          notify.success({
            title: "Spot reserved",
            description: "Your reservation is recorded.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify.info({
            title: "Reserved — Payment Needed",
            description: "Your spot is held, not confirmed yet.",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify.warning({
            title: "Hold expires soon",
            description: "Pay before the deadline to keep this slot.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          notify.error({
            title: "Proof upload failed",
            description: "We could not save that image. Check the file and try again.",
          })
        }
      >
        Error
      </Button>
    </Panel>
  ),
};

export const Loading: Story = {
  name: "Loading — resolved by the caller",
  render: () => {
    const [pendingId, setPendingId] = useState<string | null>(null);
    return (
      <Panel hint="Loading toasts never auto-dismiss. The caller closes them once the mock mutation settles.">
        <Button
          disabled={pendingId !== null}
          onClick={() =>
            setPendingId(
              notify.loading({
                title: "Submitting proof",
                description: "Hold on while the studio receives your screenshot.",
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
            notify.portal("payment.proof-submitted");
          }}
        >
          Resolve it
        </Button>
      </Panel>
    );
  },
};

export const Stacked: Story = {
  name: "Stacked — portal vocabulary",
  render: () => (
    <Panel hint="The viewport stacks up to three toasts and marks older ones as limited. Copy comes from the reviewed @balanse/domain vocabulary.">
      <Button
        onClick={() => {
          notify.portal("booking.held-awaiting-payment");
          notify.portal("payment.gcash-selected");
          notify.portal("payment.proof-submitted");
        }}
      >
        Stack three toasts
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          for (const id of PORTAL_TOAST_IDS) notify.portal(id);
        }}
      >
        Raise every message
      </Button>
      <Button variant="ghost" onClick={() => notify.dismiss()}>
        Dismiss all
      </Button>
    </Panel>
  ),
};
