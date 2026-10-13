import { manilaYmd, sessionOverlapsManilaDay } from "@balanse/domain";
import { adminSessions, MOCK_NOW_ISO } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SelectedSessionPanel } from "./SelectedSessionPanel";

const ymd = manilaYmd(MOCK_NOW_ISO);
const meta = {
  title: "Admin/Schedule/SelectedSessionPanel",
  component: SelectedSessionPanel,
  args: {
    ymd,
    daySessions: adminSessions.filter((row) => sessionOverlapsManilaDay(row, ymd)),
    allSessions: adminSessions,
    selectedSessionId: null,
    inventory: null,
    onClose: () => {},
    onSelectSession: () => {},
  },
  render: function Preview(args) {
    const [selected, setSelected] = useState<string | null>(args.selectedSessionId);
    return (
      <div className="h-[48rem] w-full max-w-[25rem] border border-border">
        <SelectedSessionPanel
          {...args}
          selectedSessionId={selected}
          onSelectSession={setSelected}
        />
      </div>
    );
  },
} satisfies Meta<typeof SelectedSessionPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DayTimeline: Story = {};
export const Details: Story = {
  args: { selectedSessionId: adminSessions.find((row) => manilaYmd(row.startsAt) === ymd)?.id },
};
const overnightSession = {
  ...adminSessions[0],
  id: "overnight-panel",
  name: "Poker Bluffing",
  startsAt: "2026-10-13T21:45:00+08:00",
  endsAt: "2026-10-14T01:45:00+08:00",
};
export const NextDayContinuation: Story = {
  args: {
    ymd: "2026-10-14",
    daySessions: [overnightSession],
    allSessions: [overnightSession],
    selectedSessionId: null,
  },
};
