import type {
  AdminCustomer,
  AdminCustomerDetail,
  CustomerProfile,
  OnboardingStatus,
  PolicyAcceptance,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type CustomerProfileResponse = CustomerProfile & {
  referralChannel: "CUSTOMER_LINK" | "CUSTOMER_QR" | "STUDIO_LINK" | "STUDIO_QR" | null;
};

export type PatchMyProfileInput = Pick<
  CustomerProfile,
  "firstName" | "lastName" | "nickname" | "contactNumber" | "showOnPublicRoster"
>;

export type AvatarUploadIntent = {
  upload: { signedUrl: string; token: string; path: string; expiresIn: number };
  objectKey: string;
  bucket: "avatars";
  maxBytes: number;
  contentTypes: string[];
};

export async function getMe(fetcher: ApiFetcher): Promise<CustomerProfileResponse> {
  return fetcher("/api/me");
}

export async function patchMe(
  fetcher: ApiFetcher,
  input: Partial<PatchMyProfileInput>,
): Promise<CustomerProfileResponse> {
  return fetcher("/api/me", { method: "PATCH", body: input });
}

export async function listMyPolicyAcceptances(fetcher: ApiFetcher): Promise<{
  items: PolicyAcceptance[];
  requiredCurrent: Array<{ documentName: string; version: string; versionId: string }>;
}> {
  return fetcher("/api/me/policy-acceptances");
}

export async function mintMyAvatarUpload(
  fetcher: ApiFetcher,
  contentType: string,
): Promise<AvatarUploadIntent> {
  return fetcher("/api/me/avatar", { method: "POST", body: { contentType } });
}

export async function confirmMyAvatarUpload(
  fetcher: ApiFetcher,
  objectKey: string,
): Promise<CustomerProfileResponse> {
  return fetcher("/api/me/avatar", { method: "POST", body: { objectKey } });
}

export async function deleteMyAvatar(fetcher: ApiFetcher): Promise<CustomerProfileResponse> {
  return fetcher("/api/me/avatar", { method: "DELETE" });
}

export type AdminCustomerFilters = {
  query?: string;
  hasUpcoming?: boolean;
  onboardingStatus?: OnboardingStatus;
  /** Defaults to fetching every page — `AdminDataTable` paginates client-side over the full list. */
  page?: number;
};

const ADMIN_CUSTOMERS_MAX_PAGE_SIZE = 100;

type AdminCustomerApiRow = Omit<AdminCustomer, "authMethod">;
type AdminCustomerPage = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminCustomerApiRow[];
};

async function fetchAdminCustomersPage(
  fetcher: ApiFetcher,
  filters: AdminCustomerFilters,
  page: number,
): Promise<AdminCustomerPage> {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.hasUpcoming) params.set("hasUpcoming", "true");
  if (filters.onboardingStatus) params.set("onboardingStatus", filters.onboardingStatus);
  params.set("page", String(page));
  params.set("pageSize", String(ADMIN_CUSTOMERS_MAX_PAGE_SIZE));
  return fetcher(`/api/admin/customers?${params}`);
}

/**
 * `GET /api/admin/customers` paginates (max page size 100); `CustomerListPage`
 * expects the full roster for its own client-side search/pagination
 * (`AdminDataTable`), same as `listAdminSessions` (WIRE-0402, #361). Pass
 * `page` to fetch one page instead (e.g. for a future server-paginated view).
 */
export async function listAdminCustomers(
  fetcher: ApiFetcher,
  filters: AdminCustomerFilters = {},
): Promise<{ page: number; pageSize: number; total: number; items: AdminCustomer[] }> {
  const first = await fetchAdminCustomersPage(fetcher, filters, filters.page ?? 1);
  const rows = [...first.items];
  if (filters.page === undefined) {
    const pageCount = Math.ceil(first.total / first.pageSize);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        fetchAdminCustomersPage(fetcher, filters, index + 2),
      ),
    );
    for (const page of rest) rows.push(...page.items);
  }
  return {
    page: first.page,
    pageSize: first.pageSize,
    total: first.total,
    // The admin customer route exposes no auth-provider claim. It is cosmetic
    // on the current detail screen and defaults to email until that claim has a
    // dedicated server-side source.
    items: rows.map((item) => ({ ...item, authMethod: "email" })),
  };
}

export async function getAdminCustomer(
  fetcher: ApiFetcher,
  id: string,
): Promise<AdminCustomerDetail> {
  return fetcher(`/api/admin/customers/${id}`);
}
