"use client";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@balanse/ui";
import { AlertTriangle } from "lucide-react";

export default function DashboardSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="border border-dashed border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>This page could not load</EmptyTitle>
        <EmptyDescription>
          {error.message || "Something went wrong while loading this admin screen. Retry the request."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={reset}>
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}
