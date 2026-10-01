import type { CustomerProfile } from "@balanse/domain";
import type { BasicProfileFormValues } from "./BasicProfileForm.schema";

export const basicProfileFormDefaultValues: BasicProfileFormValues = {
  firstName: "",
  lastName: "",
  nickname: "",
  email: "",
  contactNumber: "",
};

export function basicProfileFormValuesFrom(profile: CustomerProfile): BasicProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickname ?? "",
    email: profile.email,
    contactNumber: profile.contactNumber,
  };
}
