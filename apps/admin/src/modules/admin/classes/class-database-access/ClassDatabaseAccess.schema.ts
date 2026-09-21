import { z } from "zod";
export const classDatabaseAccessSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(1024),
});
export type ClassDatabaseAccessProps = {
  disconnect?: () => Promise<void>;
  canSave: boolean;
  connect?: (input: z.infer<typeof classDatabaseAccessSchema>) => Promise<{ error?: string }>;
  onConnected: () => void;
};
