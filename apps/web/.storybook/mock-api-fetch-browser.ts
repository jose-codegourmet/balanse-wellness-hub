import type { ApiFetcher } from "@balanse/api-client";
import type {
  BundleAcquisition,
  CustomerBooking,
  CustomerEntitlement,
  PublicBundle,
} from "@balanse/domain";
import { customers, getMockAdapter } from "@balanse/mock";

const customerId = customers[0].id;
const money = (value: number) => value.toFixed(2);

function bookingWire(booking: CustomerBooking) {
  return {
    ...booking,
    profileId: booking.customerId,
    reservedAt: booking.createdAt,
    session: { ...booking.session, customerPrice: money(booking.session.pricePhp) },
    targetSession: booking.targetSession
      ? { ...booking.targetSession, customerPrice: money(booking.targetSession.pricePhp) }
      : null,
  };
}

function packageWire(bundle: PublicBundle) {
  return {
    ...bundle,
    sessionCreditCount: bundle.sessionCredits,
    applicabilityMode: bundle.applicability.allActiveClasses
      ? "ALL_ACTIVE_CLASSES"
      : "EXPLICIT_CLASSES",
    classIds: bundle.applicability.classIds,
  };
}

function acquisitionWire(acquisition: BundleAcquisition) {
  return {
    ...acquisition,
    profileId: acquisition.customerId,
    kind:
      acquisition.channel === "ADMIN_GRANT"
        ? "ADMIN_GRANT"
        : acquisition.channel === "SELF_CLAIM"
          ? "CUSTOMER_CLAIM"
          : "CUSTOMER_PAID",
    payment:
      acquisition.channel === "SELF_PURCHASE"
        ? { method: "GCASH", status: "SUBMITTED", amountPhp: acquisition.pricePhp }
        : null,
  };
}

function entitlementWire(entitlement: CustomerEntitlement) {
  return {
    ...entitlement,
    profileId: entitlement.customerId,
    name: entitlement.snapshot.name,
    sessionCreditCount: entitlement.snapshot.sessionCredits,
    pricePhp: entitlement.snapshot.pricePhp,
    applicabilityMode: entitlement.snapshot.applicability.allActiveClasses
      ? "ALL_ACTIVE_CLASSES"
      : "EXPLICIT_CLASSES",
    classIds: entitlement.snapshot.applicability.classIds,
    validityDays: entitlement.snapshot.validityDays,
    balances: {
      granted: entitlement.grantedCredits,
      held: entitlement.heldCredits,
      consumed: entitlement.consumedCredits,
      restored: entitlement.restoredCredits,
      remaining: entitlement.remainingCredits,
    },
    grantedAt: entitlement.createdAt,
    revokeReason: null,
    acquisition: null,
  };
}

/** Storybook transport for the typed client functions used by the app. */
export const apiFetchBrowser: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toUpperCase();
  const url = new URL(path, "http://storybook.local");
  const route = url.pathname;
  if (method === "GET" && route === "/api/public/classes") {
    return { items: await adapter.getPublicClasses() } as never;
  }
  if (method === "GET" && route === "/api/public/coaches") {
    return { items: await adapter.getPublicCoaches() } as never;
  }
  if (method === "GET" && route === "/api/public/sessions") {
    return {
      items: await adapter.getPublicSessions({
        from: url.searchParams.get("from") ?? undefined,
        to: url.searchParams.get("to") ?? undefined,
      }),
    } as never;
  }
  const publicSession = /^\/api\/public\/sessions\/([^/]+)$/.exec(route);
  if (method === "GET" && publicSession) {
    return (await adapter.getPublicSessionPage(publicSession[1])) as never;
  }
  const publicRoster = /^\/api\/public\/sessions\/([^/]+)\/roster$/.exec(route);
  if (method === "GET" && publicRoster) {
    return (await adapter.getPublicRoster(publicRoster[1], { customerId })) as never;
  }
  const publicEvent = /^\/api\/public\/events\/([^/]+)$/.exec(route);
  if (method === "GET" && publicEvent) {
    return (await adapter.getPublicEventPage(publicEvent[1])) as never;
  }
  if (method === "GET" && route === "/api/public/content") {
    const [content, settings] = await Promise.all([
      adapter.getPublicContent(),
      adapter.getAdminSettings(),
    ]);
    return {
      ...content,
      business: {
        name: settings.businessName,
        phone: settings.contact.phone,
        email: settings.contact.email,
        address: settings.contact.address,
        instagram: "",
        tiktok: "",
        whatsapp: "",
        openingHours: settings.openingHours,
      },
    } as never;
  }
  if (method === "GET" && route === "/api/public/packages") {
    return { items: (await adapter.getPublicBundles()).map(packageWire) } as never;
  }
  const publicPackage = /^\/api\/public\/packages\/([^/]+)$/.exec(route);
  if (method === "GET" && publicPackage) {
    const bundle = await adapter.getPublicBundle(decodeURIComponent(publicPackage[1]));
    return { package: bundle ? packageWire(bundle) : null } as never;
  }
  const policyForm = /^\/api\/public\/policy-forms\/([^/]+)$/.exec(route);
  if (method === "GET" && policyForm) {
    const items = await adapter.getCustomerFormPolicies(
      policyForm[1] as Parameters<typeof adapter.getCustomerFormPolicies>[0],
    );
    return {
      items: items.map((item) => ({
        ...item,
        documentId: item.id,
        title: item.documentName,
        isPlaceholder: true,
      })),
    } as never;
  }
  if (method === "GET" && route === "/api/me") {
    return (await adapter.getMe(customerId)) as never;
  }
  if (method === "PATCH" && route === "/api/me") {
    return (await adapter.patchMe(customerId, init?.body as never)) as never;
  }
  if (method === "GET" && route === "/api/me/onboarding") {
    return { onboarding: await adapter.getMyOnboarding(customerId) } as never;
  }
  if (method === "PATCH" && route === "/api/me/onboarding") {
    return { onboarding: await adapter.saveMyOnboarding(customerId, init?.body as never) } as never;
  }
  if (method === "POST" && route === "/api/me/onboarding/complete") {
    return (await adapter.completeOnboarding(customerId)) as never;
  }
  if (method === "POST" && route === "/api/me/onboarding/skip") {
    return (await adapter.skipOnboarding(customerId)) as never;
  }
  if (method === "GET" && route === "/api/me/policy-acceptances") {
    return { items: await adapter.getMePolicyAcceptances(customerId), requiredCurrent: [] } as never;
  }
  if (method === "POST" && route === "/api/me/policy-acceptances") {
    const body = init?.body as
      | { form: Parameters<typeof adapter.getCustomerFormPolicies>[0]; policyVersionIds: string[] }
      | undefined;
    if (!body) throw new Error("Policy acceptance is missing its form.");
    const now = new Date().toISOString();
    const versions = await adapter.getCustomerFormPolicies(body.form);
    await adapter.acceptPolicies(
      customerId,
      versions
        .filter((version) => body.policyVersionIds.includes(version.id))
        .map((version) => ({
          documentName: version.documentName,
          version: version.version,
          acceptedAt: now,
          form: body.form,
        })),
    );
    return { acceptedAt: now, form: body.form, policyVersionIds: body.policyVersionIds } as never;
  }
  if (method === "GET" && route === "/api/me/packages") {
    const [entitlements, acquisitions] = await Promise.all([
      adapter.getMyEntitlements(customerId),
      adapter.getMyAcquisitions(customerId),
    ]);
    return {
      items: entitlements.map(entitlementWire),
      pendingAcquisitions: acquisitions.map(acquisitionWire),
    } as never;
  }
  const myPackage = /^\/api\/me\/packages\/([^/]+)$/.exec(route);
  if (method === "GET" && myPackage) {
    const item = await adapter.getMyEntitlement(customerId, myPackage[1]);
    return { entitlement: item ? entitlementWire(item) : null } as never;
  }
  const redemptions = /^\/api\/me\/packages\/([^/]+)\/redemptions$/.exec(route);
  if (method === "GET" && redemptions) {
    return { items: await adapter.getEntitlementRedemptions(customerId, redemptions[1]) } as never;
  }
  const eligible = /^\/api\/sessions\/([^/]+)\/eligible-packages$/.exec(route);
  if (method === "GET" && eligible) {
    return {
      items: (await adapter.getEligibleEntitlements(customerId, eligible[1])).map(entitlementWire),
      sessionId: eligible[1],
    } as never;
  }
  if (method === "GET" && route === "/api/bookings") {
    const bookings = await adapter.getBookings(customerId);
    return {
      items: bookings.map(bookingWire),
    } as never;
  }
  if (method === "POST" && route === "/api/bookings") {
    const body = init?.body as {
      sessionId: string;
      entitlementId?: string | null;
      intendedEntitlementId?: string | null;
    };
    const booking = await adapter.createBooking({ customerId, ...body });
    return {
      kind: booking.status === "WAITLISTED" ? "waitlist" : "hold",
      booking: bookingWire(booking),
    } as never;
  }
  const booking = /^\/api\/bookings\/([^/]+)$/.exec(route);
  if (method === "GET" && booking) {
    const item = await adapter.getBooking(booking[1]);
    return { booking: item ? bookingWire(item) : null } as never;
  }
  const waitlist = /^\/api\/bookings\/([^/]+)\/waitlist$/.exec(route);
  if (method === "POST" && waitlist) {
    return { kind: "waitlist", booking: bookingWire(await adapter.joinWaitlist(waitlist[1])) } as never;
  }
  const paymentMethod = /^\/api\/bookings\/([^/]+)\/payment-method$/.exec(route);
  if (method === "POST" && paymentMethod) {
    const body = init?.body as { method: Parameters<typeof adapter.setPaymentMethod>[1] };
    return { booking: await adapter.setPaymentMethod(paymentMethod[1], body.method) } as never;
  }
  const cancellation = /^\/api\/bookings\/([^/]+)\/cancellation-request$/.exec(route);
  if (method === "POST" && cancellation) {
    const body = init?.body as { reason?: string } | undefined;
    return { booking: await adapter.createCancellationRequest(cancellation[1], body?.reason) } as never;
  }
  const reschedule = /^\/api\/bookings\/([^/]+)\/reschedule-request$/.exec(route);
  if (method === "POST" && reschedule) {
    const body = init?.body as { targetSessionId: string };
    return {
      booking: await adapter.createRescheduleRequest(reschedule[1], body.targetSessionId),
    } as never;
  }
  const claim = /^\/api\/packages\/([^/]+)\/claim$/.exec(route);
  if (method === "POST" && claim) {
    const body = init?.body as { idempotencyKey?: string } | undefined;
    const entitlement = await adapter.claimFreeBundle({
      customerId,
      bundleId: claim[1],
      idempotencyKey: body?.idempotencyKey,
    });
    const acquisition = (await adapter.getMyAcquisitions(customerId)).find(
      (row) => row.id === entitlement.acquisitionId,
    );
    return {
      entitlement: entitlementWire(entitlement),
      acquisition: acquisition ? acquisitionWire(acquisition) : null,
      replayed: false,
    } as never;
  }
  const request = /^\/api\/packages\/([^/]+)\/acquisitions$/.exec(route);
  if (method === "POST" && request) {
    const body = init?.body as { idempotencyKey?: string } | undefined;
    const acquisition = await adapter.requestPaidBundle({
      customerId,
      bundleId: request[1],
      idempotencyKey: body?.idempotencyKey,
    });
    return { acquisition: acquisitionWire(acquisition), replayed: false } as never;
  }
  if (method === "GET" && route === "/api/payment-instructions") {
    const instructions = await adapter.getPaymentInstructions();
    return {
      accountName: instructions.gcashName,
      number: instructions.gcashNumber,
      qrObjectKey: instructions.qrImageKey,
      qrPublicUrl: instructions.qrImageKey,
      accounts: instructions.accounts,
    } as never;
  }
  throw new Error(`Storybook API fetcher: unhandled ${method} ${path}`);
};
