import {
  customRoleIdentityConflicts,
  customRoleKeyFromName,
  FIELD_CONSTRAINTS,
  isValidCustomPermissionSet,
  PERMISSION_KEYS,
} from "@balanse/domain";
import { z } from "zod";

export const roleFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a role name.").max(FIELD_CONSTRAINTS.role.name.max),
    description: z.string().trim().max(FIELD_CONSTRAINTS.role.description.max),
    permissionKeys: z
      .array(z.enum(PERMISSION_KEYS))
      .refine(isValidCustomPermissionSet, "Select at least one permission."),
    cloneSourceId: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    const key = customRoleKeyFromName(values.name);
    if (!key) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Enter a role name." });
      return;
    }
    if (customRoleIdentityConflicts(values.name, key)) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Custom roles cannot reuse a built-in name.",
      });
    }
  });

export type RoleFormValues = z.infer<typeof roleFormSchema>;
