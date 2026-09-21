import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
export type ClassDetailPageProps = {
  gymClass: PublicClass | null;
  coaches: PublicCoach[];
  sessions: PublicSession[];
  preview?: boolean;
};
