"use client";

import { useEffect } from "react";
import { useAdminFormContext } from "../forms/AdminForm";

export function DirtyBridge({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const { formState } = useAdminFormContext();

  useEffect(() => {
    onDirtyChange?.(formState.isDirty);
  }, [formState.isDirty, onDirtyChange]);

  return null;
}
