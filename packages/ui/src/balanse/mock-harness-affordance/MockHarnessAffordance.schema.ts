import type * as React from "react";

export type MockHarnessAffordanceProps = React.ComponentProps<"button"> & {
  panelId: string;
};
