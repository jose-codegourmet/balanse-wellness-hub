import type { RoleFormValues } from "./RoleForm.schema";

export const roleFormDefaultValues: RoleFormValues = {
  name: "",
  description: "",
  permissionKeys: [],
  cloneSourceId: null,
};

export function roleFormValuesFrom(input: {
  name: string;
  description: string;
  permissionKeys: readonly string[];
  cloneSourceId?: string | null;
}): RoleFormValues {
  return {
    name: input.name,
    description: input.description,
    permissionKeys: [...input.permissionKeys] as RoleFormValues["permissionKeys"],
    cloneSourceId: input.cloneSourceId ?? null,
  };
}
