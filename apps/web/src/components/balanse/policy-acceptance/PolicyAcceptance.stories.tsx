import type { PolicyDocumentVersion } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PolicyAcceptance, usePolicyAcceptance } from "./PolicyAcceptance";

const policies: PolicyDocumentVersion[] = [
  {
    id: "policy-waiver-2026-01",
    documentName: "Waiver",
    version: "2026-01",
    promotedAt: "2026-01-15T00:00:00.000Z",
    current: true,
    body: "Please review the studio waiver before attending your first session.",
  },
  {
    id: "policy-gym-2026-01",
    documentName: "Gym Policy",
    version: "2026-01",
    promotedAt: "2026-01-15T00:00:00.000Z",
    current: true,
    body: "Please follow studio etiquette, safety guidance, and **instructor direction**.",
  },
];

function Demo({ tone, error = false }: { tone?: "default" | "inverse"; error?: boolean }) {
  const acceptance = usePolicyAcceptance(policies);
  return (
    <div className={tone === "inverse" ? "bg-primary p-6 text-primary-foreground" : "p-6"}>
      <PolicyAcceptance
        {...acceptance.props}
        showError={error || acceptance.props.showError}
        tone={tone}
      />
    </div>
  );
}

const meta = {
  title: "Customer/Components/PolicyAcceptance",
  component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MissingAcceptance: Story = { args: { error: true } };

/** Package hero: sits on the dark primary surface. */
export const Inverse: Story = { args: { tone: "inverse" } };
