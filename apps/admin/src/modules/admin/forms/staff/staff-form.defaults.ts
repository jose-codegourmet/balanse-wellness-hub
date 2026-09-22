import type { StaffFormValues } from "./staff-form.schema";

export const staffFormDefaultValues: StaffFormValues = {
  name: "",
  email: "",
  roleId: "",
  status: "active",
  isCoach: false,
};
