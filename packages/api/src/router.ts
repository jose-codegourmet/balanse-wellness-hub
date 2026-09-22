import { API_CONTRACT_ROUTES, type HttpMethod } from "@balanse/db/contracts/routes";
import type { ApiDeps } from "./deps";
import { getAdminBookings, postAdminConfirm, postAdminReject } from "./handlers/admin-bookings";
import {
  getAdminAcquisitions,
  getAdminBundle,
  getAdminBundles,
  getAdminCustomerPackages,
  getAdminEntitlementRedemptions,
  patchAdminBundle,
  postAdminBundle,
  postApproveAcquisition,
  postArchiveBundle,
  postGrantPackage,
  postPublishBundle,
  postRejectAcquisition,
  postRevokePackage,
  postUnpublishBundle,
} from "./handlers/admin-bundles";
import {
  deleteCoachPhoto,
  getAdminClasses,
  getAdminCoaches,
  getAdminSessions,
  patchAdminClass,
  patchAdminCoach,
  patchAdminSession,
  postAdminClass,
  postAdminCoach,
  postAdminSession,
  postAdminSessionRecurrence,
  postCancelSession,
  postCoachPhoto,
  postDuplicateAdminSessions,
} from "./handlers/admin-catalogue";
import { getAdminDashboard, getAdminDashboardMetrics } from "./handlers/admin-dashboard";
import {
  getAdminPayments,
  getPaymentProofSignedUrl,
  postMarkRefunded,
  postMarkRefundPending,
  postRecordCash,
} from "./handlers/admin-payments";
import {
  assignStaffRole,
  disableStaff,
  getCustomer,
  getCustomers,
  getStaff,
  linkStaffCoach,
  patchStaff,
  postStaff,
  unlinkStaffCoach,
} from "./handlers/admin-people";
import {
  getClassPerformance,
  getCoachCosts,
  getSalesOverview,
  getSessionPerformance,
  getSessionReport,
} from "./handlers/admin-reports";
import {
  approveReschedule,
  completeCancellation,
  getCancellationRequests,
  getRescheduleRequests,
  rejectCancellation,
  rejectReschedule,
} from "./handlers/admin-requests";
import {
  archiveRole,
  cloneRole,
  getPermissionRegistry,
  getRole,
  getRoles,
  patchRole,
  postRole,
} from "./handlers/admin-roles";
import { getSessionRoster, postCheckIn, postNoShow } from "./handlers/admin-roster";
import {
  activatePaymentQrHandler,
  archivePaymentQr,
  deleteFaq,
  deleteSettingsQr,
  getAdminSettings,
  getPaymentQrs,
  patchAdminSettings,
  patchFaq,
  patchPaymentQr,
  postFaq,
  postPaymentQr,
  postSettingsQr,
  promotePolicy,
  reorderFaqs,
} from "./handlers/admin-settings";
import {
  getBooking,
  getBookings,
  getPaymentInstructions,
  postBookings,
  postCancellationRequest,
  postPaymentMethod,
  postPaymentProof,
  postRescheduleRequest,
  postWaitlist,
} from "./handlers/bookings";
import { getMe, getPolicyAcceptances, patchMe } from "./handlers/me";
import {
  getEligiblePackages,
  getMyPackage,
  getMyPackageRedemptions,
  getMyPackages,
  getPublicPackage,
  getPublicPackages,
  postAcquisitionPaymentMethod,
  postAcquisitionPaymentProof,
  postClaimPackage,
  postPaidAcquisition,
} from "./handlers/packages";
import {
  getPublicClasses,
  getPublicCoaches,
  getPublicContent,
  getPublicSession,
  getPublicSessions,
} from "./handlers/public";

export type RouteHandler = (
  deps: ApiDeps,
  req: Request,
  params: Record<string, string>,
) => Promise<Response>;

export type CompiledRoute = {
  ticket: string;
  method: HttpMethod;
  path: string;
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
};

function compile(path: string): { pattern: RegExp; keys: string[] } {
  const keys: string[] = [];
  const source = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith("{") && segment.endsWith("}")) {
        keys.push(segment.slice(1, -1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { pattern: new RegExp(`^${source}$`), keys };
}

const handlers: Record<string, RouteHandler> = {
  "GET /api/public/sessions": (deps, req) => getPublicSessions(deps, req),
  "GET /api/public/sessions/{id}": (deps, req, params) => getPublicSession(deps, req, params.id),
  "GET /api/public/coaches": (deps) => getPublicCoaches(deps),
  "GET /api/public/classes": (deps) => getPublicClasses(deps),
  "GET /api/public/content": (deps) => getPublicContent(deps),
  "GET /api/public/packages": (deps) => getPublicPackages(deps),
  "GET /api/public/packages/{slug}": (deps, _req, params) => getPublicPackage(deps, params.slug),
  "GET /api/me/packages": (deps, req) => getMyPackages(deps, req),
  "GET /api/me/packages/{id}": (deps, req, params) => getMyPackage(deps, req, params.id),
  "GET /api/me/packages/{id}/redemptions": (deps, req, params) =>
    getMyPackageRedemptions(deps, req, params.id),
  "POST /api/packages/{id}/claim": (deps, req, params) => postClaimPackage(deps, req, params.id),
  "POST /api/packages/{id}/acquisitions": (deps, req, params) =>
    postPaidAcquisition(deps, req, params.id),
  "POST /api/packages/acquisitions/{id}/payment-method": (deps, req, params) =>
    postAcquisitionPaymentMethod(deps, req, params.id),
  "POST /api/packages/acquisitions/{id}/payment-proof": (deps, req, params) =>
    postAcquisitionPaymentProof(deps, req, params.id),
  "GET /api/sessions/{id}/eligible-packages": (deps, req, params) =>
    getEligiblePackages(deps, req, params.id),
  "GET /api/admin/bundles": (deps, req) => getAdminBundles(deps, req),
  "POST /api/admin/bundles": (deps, req) => postAdminBundle(deps, req),
  "GET /api/admin/bundles/{id}": (deps, req, params) => getAdminBundle(deps, req, params.id),
  "PATCH /api/admin/bundles/{id}": (deps, req, params) => patchAdminBundle(deps, req, params.id),
  "POST /api/admin/bundles/{id}/publish": (deps, req, params) =>
    postPublishBundle(deps, req, params.id),
  "POST /api/admin/bundles/{id}/unpublish": (deps, req, params) =>
    postUnpublishBundle(deps, req, params.id),
  "POST /api/admin/bundles/{id}/archive": (deps, req, params) =>
    postArchiveBundle(deps, req, params.id),
  "GET /api/admin/customers/{id}/packages": (deps, req, params) =>
    getAdminCustomerPackages(deps, req, params.id),
  "POST /api/admin/customers/{id}/packages/grant": (deps, req, params) =>
    postGrantPackage(deps, req, params.id),
  "POST /api/admin/packages/{id}/revoke": (deps, req, params) =>
    postRevokePackage(deps, req, params.id),
  "GET /api/admin/package-acquisitions": (deps, req) => getAdminAcquisitions(deps, req),
  "POST /api/admin/package-acquisitions/{id}/approve": (deps, req, params) =>
    postApproveAcquisition(deps, req, params.id),
  "POST /api/admin/package-acquisitions/{id}/reject": (deps, req, params) =>
    postRejectAcquisition(deps, req, params.id),
  "GET /api/admin/packages/{id}/redemptions": (deps, req, params) =>
    getAdminEntitlementRedemptions(deps, req, params.id),
  "GET /api/me": (deps, req) => getMe(deps, req),
  "PATCH /api/me": (deps, req) => patchMe(deps, req),
  "GET /api/me/policy-acceptances": (deps, req) => getPolicyAcceptances(deps, req),
  "POST /api/bookings": (deps, req) => postBookings(deps, req),
  "POST /api/bookings/{id}/waitlist": (deps, req, params) => postWaitlist(deps, req, params.id),
  "GET /api/bookings": (deps, req) => getBookings(deps, req),
  "GET /api/bookings/{id}": (deps, req, params) => getBooking(deps, req, params.id),
  "POST /api/bookings/{id}/payment-method": (deps, req, params) =>
    postPaymentMethod(deps, req, params.id),
  "POST /api/bookings/{id}/payment-proof": (deps, req, params) =>
    postPaymentProof(deps, req, params.id),
  "GET /api/payment-instructions": (deps, req) => getPaymentInstructions(deps, req),
  "POST /api/bookings/{id}/cancellation-request": (deps, req, params) =>
    postCancellationRequest(deps, req, params.id),
  "POST /api/bookings/{id}/reschedule-request": (deps, req, params) =>
    postRescheduleRequest(deps, req, params.id),
  "GET /api/admin/bookings": (deps, req) => getAdminBookings(deps, req),
  "POST /api/admin/bookings/{id}/confirm": (deps, req, params) =>
    postAdminConfirm(deps, req, params.id),
  "POST /api/admin/bookings/{id}/reject": (deps, req, params) =>
    postAdminReject(deps, req, params.id),
  "GET /api/admin/payments": (deps, req) => getAdminPayments(deps, req),
  "GET /api/admin/payment-proofs/{id}/signed-url": (deps, req, params) =>
    getPaymentProofSignedUrl(deps, req, params.id),
  "POST /api/admin/payments/{id}/record-cash": (deps, req, params) =>
    postRecordCash(deps, req, params.id),
  "POST /api/admin/refunds/{id}/mark-pending": (deps, req, params) =>
    postMarkRefundPending(deps, req, params.id),
  "POST /api/admin/refunds/{id}/mark-refunded": (deps, req, params) =>
    postMarkRefunded(deps, req, params.id),
  "GET /api/admin/classes": (deps, req) => getAdminClasses(deps, req),
  "POST /api/admin/classes": (deps, req) => postAdminClass(deps, req),
  "PATCH /api/admin/classes/{id}": (deps, req, params) => patchAdminClass(deps, req, params.id),
  "GET /api/admin/coaches": (deps, req) => getAdminCoaches(deps, req),
  "POST /api/admin/coaches": (deps, req) => postAdminCoach(deps, req),
  "PATCH /api/admin/coaches/{id}": (deps, req, params) => patchAdminCoach(deps, req, params.id),
  "POST /api/admin/coaches/{id}/photo": (deps, req, params) => postCoachPhoto(deps, req, params.id),
  "DELETE /api/admin/coaches/{id}/photo": (deps, req, params) =>
    deleteCoachPhoto(deps, req, params.id),
  "GET /api/admin/sessions": (deps, req) => getAdminSessions(deps, req),
  "POST /api/admin/sessions": (deps, req) => postAdminSession(deps, req),
  "POST /api/admin/sessions/duplicate": (deps, req) => postDuplicateAdminSessions(deps, req),
  "PATCH /api/admin/sessions/{id}": (deps, req, params) => patchAdminSession(deps, req, params.id),
  "POST /api/admin/sessions/{id}/recurrence": (deps, req, params) =>
    postAdminSessionRecurrence(deps, req, params.id),
  "POST /api/admin/sessions/{id}/cancel": (deps, req, params) =>
    postCancelSession(deps, req, params.id),
  "GET /api/admin/cancellation-requests": (deps, req) => getCancellationRequests(deps, req),
  "POST /api/admin/cancellation-requests/{id}/complete": (deps, req, params) =>
    completeCancellation(deps, req, params.id),
  "POST /api/admin/cancellation-requests/{id}/reject": (deps, req, params) =>
    rejectCancellation(deps, req, params.id),
  "GET /api/admin/reschedule-requests": (deps, req) => getRescheduleRequests(deps, req),
  "POST /api/admin/reschedule-requests/{id}/approve": (deps, req, params) =>
    approveReschedule(deps, req, params.id),
  "POST /api/admin/reschedule-requests/{id}/reject": (deps, req, params) =>
    rejectReschedule(deps, req, params.id),
  "GET /api/admin/sessions/{id}/roster": (deps, req, params) =>
    getSessionRoster(deps, req, params.id),
  "POST /api/admin/sessions/{id}/check-in": (deps, req, params) =>
    postCheckIn(deps, req, params.id),
  "POST /api/admin/sessions/{id}/no-show": (deps, req, params) => postNoShow(deps, req, params.id),
  "GET /api/admin/reports/sales-overview": (deps, req) => getSalesOverview(deps, req),
  "GET /api/admin/reports/class-performance": (deps, req) => getClassPerformance(deps, req),
  "GET /api/admin/reports/coach-costs": (deps, req) => getCoachCosts(deps, req),
  "GET /api/admin/reports/session-performance": (deps, req) => getSessionPerformance(deps, req),
  "GET /api/admin/reports/sessions/{id}": (deps, req, params) =>
    getSessionReport(deps, req, params.id),
  "GET /api/admin/staff": (deps, req) => getStaff(deps, req),
  "POST /api/admin/staff": (deps, req) => postStaff(deps, req),
  "PATCH /api/admin/staff/{id}": (deps, req, params) => patchStaff(deps, req, params.id),
  "POST /api/admin/staff/{id}/disable": (deps, req, params) => disableStaff(deps, req, params.id),
  "POST /api/admin/staff/{id}/coach": (deps, req, params) => linkStaffCoach(deps, req, params.id),
  "DELETE /api/admin/staff/{id}/coach": (deps, req, params) =>
    unlinkStaffCoach(deps, req, params.id),
  "POST /api/admin/staff/{id}/role": (deps, req, params) => assignStaffRole(deps, req, params.id),
  "GET /api/admin/permissions": (deps, req) => getPermissionRegistry(deps, req),
  "GET /api/admin/roles": (deps, req) => getRoles(deps, req),
  "POST /api/admin/roles": (deps, req) => postRole(deps, req),
  "GET /api/admin/roles/{id}": (deps, req, params) => getRole(deps, req, params.id),
  "PATCH /api/admin/roles/{id}": (deps, req, params) => patchRole(deps, req, params.id),
  "POST /api/admin/roles/{id}/clone": (deps, req, params) => cloneRole(deps, req, params.id),
  "POST /api/admin/roles/{id}/archive": (deps, req, params) => archiveRole(deps, req, params.id),
  "GET /api/admin/customers": (deps, req) => getCustomers(deps, req),
  "GET /api/admin/customers/{id}": (deps, req, params) => getCustomer(deps, req, params.id),
  "GET /api/admin/settings": (deps, req) => getAdminSettings(deps, req),
  "PATCH /api/admin/settings": (deps, req) => patchAdminSettings(deps, req),
  "POST /api/admin/settings/qr": (deps, req) => postSettingsQr(deps, req),
  "DELETE /api/admin/settings/qr": (deps, req) => deleteSettingsQr(deps, req),
  "GET /api/admin/settings/payment-qrs": (deps, req) => getPaymentQrs(deps, req),
  "POST /api/admin/settings/payment-qrs": (deps, req) => postPaymentQr(deps, req),
  "PATCH /api/admin/settings/payment-qrs/{id}": (deps, req, params) =>
    patchPaymentQr(deps, req, params.id),
  "POST /api/admin/settings/payment-qrs/{id}/activate": (deps, req, params) =>
    activatePaymentQrHandler(deps, req, params.id),
  "DELETE /api/admin/settings/payment-qrs/{id}": (deps, req, params) =>
    archivePaymentQr(deps, req, params.id),
  "POST /api/admin/settings/faqs": (deps, req) => postFaq(deps, req),
  "PATCH /api/admin/settings/faqs/{id}": (deps, req, params) => patchFaq(deps, req, params.id),
  "DELETE /api/admin/settings/faqs/{id}": (deps, req, params) => deleteFaq(deps, req, params.id),
  "POST /api/admin/settings/faqs/reorder": (deps, req) => reorderFaqs(deps, req),
  "POST /api/admin/settings/policies/{id}/promote": (deps, req, params) =>
    promotePolicy(deps, req, params.id),
  "GET /api/admin/dashboard": (deps, req) => getAdminDashboard(deps, req),
  "GET /api/admin/dashboard/metrics": (deps, req) => getAdminDashboardMetrics(deps, req),
};

export function compiledRoutes(): CompiledRoute[] {
  return API_CONTRACT_ROUTES.map((route) => {
    const key = `${route.method.toUpperCase()} ${route.path}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`Missing handler for ${key}`);
    }
    const { pattern, keys } = compile(route.path);
    return { ...route, pattern, keys, handler };
  });
}

export const ROUTES = compiledRoutes();

export function matchRoute(
  method: string,
  pathname: string,
): { route: CompiledRoute; params: Record<string, string> } | null {
  const normalized = method.toLowerCase() as HttpMethod;
  for (const route of ROUTES) {
    if (route.method !== normalized) continue;
    const match = pathname.match(route.pattern);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1]);
    });
    return { route, params };
  }
  return null;
}
