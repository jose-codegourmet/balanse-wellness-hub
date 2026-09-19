import type { PublicCoach } from "@balanse/domain";
import { BalanseCoachesDirectory } from "@/components/balanse/marketing/BalanseCoachesDirectory";

export function CoachesPage(props: { coaches: PublicCoach[]; initialSpecialty?: string }) {
  return <BalanseCoachesDirectory {...props} />;
}
