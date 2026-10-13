import { PackageRequestForm } from "./PackageRequestForm";

export default { title: "Public/Packages/PackageRequestForm", component: PackageRequestForm };

export const Free = {
  args: {
    customerId: "story-customer",
    bundleId: "story-package",
    free: true,
    actionLabel: "Claim this package",
  },
};
