import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";

export async function getServerMockPrincipal() {
  const store = await cookies();
  return parseMockPrincipal(store.get(MOCK_HARNESS_COOKIE)?.value);
}
