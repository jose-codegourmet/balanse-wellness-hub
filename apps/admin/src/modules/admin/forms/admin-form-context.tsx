"use client";

import { createContext, useContext } from "react";
import { type FieldValues, type UseFormReturn, useFormContext } from "react-hook-form";

export type AdminFieldMeta = { label: string; id?: string };

export type AdminFormKitValue = {
  registerField: (name: string, meta: AdminFieldMeta) => void;
  unregisterField: (name: string) => void;
  getLabel: (name: string) => string;
  getFieldId: (name: string) => string | undefined;
};

const AdminFormKitContext = createContext<AdminFormKitValue | null>(null);

export function AdminFormKitProvider({
  value,
  children,
}: {
  value: AdminFormKitValue;
  children: React.ReactNode;
}) {
  return <AdminFormKitContext.Provider value={value}>{children}</AdminFormKitContext.Provider>;
}

export function useAdminFormContext<
  TValues extends FieldValues = FieldValues,
>(): UseFormReturn<TValues> & AdminFormKitValue {
  const form = useFormContext<TValues>();
  const kit = useContext(AdminFormKitContext);
  if (!kit) {
    throw new Error("useAdminFormContext must be used inside AdminForm");
  }
  return { ...form, ...kit };
}
