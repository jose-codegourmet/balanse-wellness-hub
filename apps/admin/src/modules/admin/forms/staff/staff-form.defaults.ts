import type { StaffFormValues } from "./staff-form.schema";

export const staffFormDefaultValues: StaffFormValues = {
  name: "",
  email: "",
  role: "ADMIN",
  status: "active",
  isCoach: false,
};
