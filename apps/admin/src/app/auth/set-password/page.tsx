import type { Metadata } from "next";
import { StaffInvitePage } from "./_components/staff-invite-page/StaffInvitePage";
import { readInviteProof } from "./_lib/invite-proof";
import { setStaffPassword } from "./_lib/set-staff-password";

export const metadata: Metadata = {
  title: "Set your staff password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page() {
  const proof = await readInviteProof();
  return (
    <StaffInvitePage
      canResume={Boolean(proof)}
      defaultTokenType={proof?.tokenType}
      onSubmit={setStaffPassword}
    />
  );
}
