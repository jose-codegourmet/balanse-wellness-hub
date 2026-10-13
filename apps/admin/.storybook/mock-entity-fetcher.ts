import type { ApiFetcher } from "@balanse/api-client";
import type {
  AdminBundle,
  AdminPaymentTab,
  AdminReportFilters,
  AdminSettings,
  BundleDefinition,
  CustomerBooking,
} from "@balanse/domain";
import { EMPTY_BUNDLE_CREDIT_METRICS } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";

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

function bundleWire(
  bundle: BundleDefinition,
  metrics: AdminBundle["metrics"] = EMPTY_BUNDLE_CREDIT_METRICS,
): AdminBundle {
  return {
    ...bundle,
    sessionCreditCount: bundle.sessionCredits,
    applicabilityMode: bundle.applicability.allActiveClasses
      ? "ALL_ACTIVE_CLASSES"
      : "EXPLICIT_CLASSES",
    classIds: bundle.applicability.classIds,
    metrics,
  };
}

function settingsWire(settings: AdminSettings) {
  return {
    business: {
      name: settings.businessName,
      openingHours: settings.openingHours,
      phone: settings.contact.phone,
      address: settings.contact.address,
    },
    content: { about: settings.about, email: settings.contact.email, faqs: settings.faqs },
    payment: {
      gcashAccountName: settings.gcashName,
      gcashNumber: settings.gcashNumber,
      qrImageKey: settings.qrImageKey,
      qrs: settings.paymentQrs ?? [],
    },
    policyDocuments: settings.policyDocuments,
    policyFormRequirements: settings.policyFormRequirements,
  };
}

/** Entity reads for screens whose hooks use the default browser fetcher. */
export const mockEntityFetcher: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toUpperCase();
  const url = new URL(path, "http://storybook.local");
  const route = url.pathname;
  const params = url.searchParams;

  if (route === "/api/admin/sessions" && method === "GET") {
    const items = await adapter.getAdminSessions();
    return { items, page: 1, pageSize: items.length || 1, total: items.length } as never;
  }
  if (route === "/api/admin/sessions" && method === "POST") {
    const body = init?.body as Record<string, unknown>;
    const session = await adapter.upsertAdminSession({
      ...(body as Parameters<typeof adapter.upsertAdminSession>[0]),
      pricePhp: Number(body.customerPrice ?? body.pricePhp ?? 0),
    });
    return { session } as never;
  }
  if (route === "/api/admin/sessions/duplicate" && method === "POST") {
    return (await adapter.duplicateAdminSchedule(
      init?.body as Parameters<typeof adapter.duplicateAdminSchedule>[0],
    )) as never;
  }
  const recurrence = /^\/api\/admin\/sessions\/([^/]+)\/recurrence$/.exec(route);
  if (recurrence && method === "POST") {
    return (await adapter.createAdminRecurringSchedule({
      ...(init?.body as Parameters<typeof adapter.createAdminRecurringSchedule>[0]),
      sourceSessionId: recurrence[1],
    })) as never;
  }
  const session = /^\/api\/admin\/sessions\/([^/]+)$/.exec(route);
  if (session && method === "PATCH") {
    const current = (await adapter.getAdminSessions()).find((row) => row.id === session[1]);
    if (!current) throw new Error("Session not found in Storybook fixtures.");
    const body = init?.body as Record<string, unknown>;
    const updated = await adapter.upsertAdminSession({
      id: session[1],
      classId: (body.classId as string | undefined) ?? current.classId,
      venueId: (body.venueId as string | undefined) ?? current.venueId,
      name: (body.name as string | null | undefined) ?? current.name,
      coachIds: (body.coachIds as string[] | undefined) ?? current.coaches.map((coach) => coach.id),
      startsAt: (body.startsAt as string | undefined) ?? current.startsAt,
      endsAt: (body.endsAt as string | undefined) ?? current.endsAt,
      pricePhp: Number(body.customerPrice ?? current.pricePhp),
      capacity: (body.capacity as number | undefined) ?? current.capacity,
      bookable: (body.bookable as boolean | undefined) ?? current.bookable,
      status: (body.status as typeof current.status | undefined) ?? current.status,
    });
    return { session: updated } as never;
  }
  const cancelSession = /^\/api\/admin\/sessions\/([^/]+)\/cancel$/.exec(route);
  if (cancelSession && method === "POST") {
    const cancelled = await adapter.cancelAdminSession(cancelSession[1]);
    return {
      session: { id: cancelled.id, status: cancelled.status },
      newReservationsBlocked: true,
      affectedBookings: [],
    } as never;
  }
  const roster = /^\/api\/admin\/sessions\/([^/]+)\/roster$/.exec(route);
  if (roster && method === "GET") return (await adapter.getAdminSessionRoster(roster[1])) as never;
  const attendance = /^\/api\/admin\/sessions\/([^/]+)\/(check-in|no-show)$/.exec(route);
  if (attendance && method === "POST") {
    const bookingId = (init?.body as { bookingId: string }).bookingId;
    return {
      booking:
        attendance[2] === "check-in"
          ? await adapter.checkIn(bookingId)
          : await adapter.markNoShow(bookingId),
    } as never;
  }

  if (route === "/api/admin/dashboard" && method === "GET") {
    const dashboard = await adapter.getAdminDashboard();
    return { ...dashboard, series: Object.values(dashboard.series ?? {}) } as never;
  }
  if (route === "/api/admin/dashboard/metrics" && method === "GET") {
    const dashboard = await adapter.getAdminDashboard();
    return {
      grain: "day",
      timezone: "Asia/Manila",
      windowDays: 30,
      series: Object.values(dashboard.series ?? {}),
    } as never;
  }

  if (route === "/api/admin/customers" && method === "GET") {
    const items = await adapter.getAdminCustomers({
      query: params.get("q") ?? undefined,
      hasUpcoming: params.get("hasUpcoming") === "true" ? true : undefined,
    });
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 100);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: items.length,
    } as never;
  }
  const customer = /^\/api\/admin\/customers\/([^/]+)$/.exec(route);
  if (customer && method === "GET") return (await adapter.getAdminCustomer(customer[1])) as never;

  if (route === "/api/admin/bookings" && method === "GET") {
    const items = await adapter.getAdminBookings({
      query: params.get("q") ?? undefined,
      classId: params.get("classId") ?? undefined,
      date: params.get("date") ?? undefined,
    });
    return { items: items.map(bookingWire), total: items.length, nextCursor: null } as never;
  }
  if (route === "/api/admin/payments" && method === "GET") {
    return (await adapter.getAdminPayments({
      tab: (params.get("tab") ?? "gcash") as AdminPaymentTab,
      search: params.get("q") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
      limit: Number(params.get("limit") ?? 20),
    })) as never;
  }
  if (route === "/api/admin/cancellation-requests" && method === "GET") {
    return (await adapter.getAdminCancellationRequests({
      search: params.get("q") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
    })) as never;
  }
  if (route === "/api/admin/reschedule-requests" && method === "GET") {
    return (await adapter.getAdminRescheduleRequests({
      search: params.get("q") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
    })) as never;
  }

  if (route.startsWith("/api/admin/reports/") && method === "GET") {
    const filters: AdminReportFilters = {
      from: params.get("from") ?? "2026-01-01",
      to: params.get("to") ?? "2027-01-01",
      classId: params.get("classId") ?? undefined,
      coachId: params.get("coachId") ?? undefined,
    };
    const report = await adapter.getAdminReports(filters);
    if (route === "/api/admin/reports/sales-overview") {
      return {
        "Gross Sales": money(report.overview.grossSalesPhp),
        Refunds: money(report.overview.refundsPhp),
        "Net Sales": money(report.overview.netSalesPhp),
        "Paid Bookings": report.overview.paidBookings,
      } as never;
    }
    if (route === "/api/admin/reports/class-performance") {
      return {
        items: report.classPerformance.map((row) => ({
          classId: row.classId,
          Class: row.className,
          Sessions: row.sessions,
          Revenue: money(row.revenuePhp),
          Occupancy: row.occupancy,
          "No-shows": row.noShows,
        })),
      } as never;
    }
    if (route === "/api/admin/reports/coach-costs") {
      return {
        items: report.coachCosts.map((row) => ({
          coachId: row.coachId,
          Coach: row.coachName,
          Sessions: row.sessions,
          "Coach Cost": money(row.coachCostPhp),
          "Related Revenue": money(row.relatedRevenuePhp),
        })),
      } as never;
    }
    if (route === "/api/admin/reports/session-performance") {
      const items = report.sessionPerformance.map((row) => ({
        sessionId: row.sessionId,
        "Date/Time": row.startsAt,
        Class: row.className,
        Capacity: row.capacity,
        Confirmed: row.confirmed,
        Revenue: money(row.revenuePhp),
        Cost: money(row.coachCostPhp),
      }));
      return { items, page: 1, pageSize: items.length || 1, total: items.length } as never;
    }
    const sessionReport = /^\/api\/admin\/reports\/sessions\/([^/]+)$/.exec(route);
    if (sessionReport) {
      const row = await adapter.getAdminSessionReport(sessionReport[1]);
      if (!row) throw new Error("Session report not found in Storybook fixtures.");
      return {
        ...row,
        Capacity: row.capacity,
        Confirmed: row.confirmed,
        Held: row.held,
        Available: row.available,
        Waitlisted: row.waitlisted,
        "Checked In": row.checkedIn,
        "No-show": row.noShow,
        "Customer Price": money(row.customerPricePhp),
        "Gross Revenue": money(row.grossRevenuePhp),
        Refunds: money(row.refundsPhp),
        "Coach Cost": money(row.coachCostPhp),
        "Gross Contribution": money(row.grossContributionPhp),
        Occupancy: row.occupancy,
        "Attendance Utilisation": row.attendanceUtilisation,
      } as never;
    }
  }

  if (route === "/api/admin/events" && method === "GET") {
    return { items: await adapter.getAdminEvents() } as never;
  }
  const event = /^\/api\/admin\/events\/([^/]+)$/.exec(route);
  if (event && method === "GET") return { event: await adapter.getAdminEvent(event[1]) } as never;

  if (route === "/api/admin/bundles" && method === "GET") {
    const [bundles, metrics] = await Promise.all([
      adapter.getAdminBundles(),
      adapter.getAdminBundleMetrics(),
    ]);
    return {
      items: bundles
        .filter((bundle) => !params.get("status") || bundle.status === params.get("status"))
        .map((bundle) => bundleWire(bundle, metrics[bundle.id])),
    } as never;
  }
  if (route === "/api/admin/bundles" && method === "POST") {
    const body = init?.body as Record<string, unknown>;
    const created = await adapter.upsertAdminBundle({
      name: String(body.name ?? ""),
      slug: String(body.slug ?? body.name ?? "").toLowerCase().replace(/\s+/g, "-"),
      summary: String(body.summary ?? ""),
      description: String(body.description ?? ""),
      sessionCredits: Number(body.sessionCreditCount ?? 0),
      pricePhp: Number(body.pricePhp ?? 0),
      allActiveClasses: body.applicabilityMode === "ALL_ACTIVE_CLASSES",
      classIds: (body.classIds as string[] | undefined) ?? [],
      validityDays: (body.validityDays as number | null | undefined) ?? null,
      perCustomerLimit: (body.perCustomerLimit as number | null | undefined) ?? null,
      status: "DRAFT",
    });
    return { bundle: bundleWire(created) } as never;
  }
  const bundle = /^\/api\/admin\/bundles\/([^/]+)$/.exec(route);
  if (bundle && method === "GET") {
    const [record, metrics] = await Promise.all([
      adapter.getAdminBundle(bundle[1]),
      adapter.getAdminBundleMetrics(),
    ]);
    return { bundle: record ? bundleWire(record, metrics[record.id]) : null } as never;
  }
  if (bundle && method === "PATCH") {
    const current = await adapter.getAdminBundle(bundle[1]);
    if (!current) throw new Error("Package not found in Storybook fixtures.");
    const body = init?.body as Record<string, unknown>;
    const updated = await adapter.upsertAdminBundle({
      id: current.id,
      name: String(body.name ?? current.name),
      slug: String(body.slug ?? current.slug),
      summary: String(body.summary ?? current.summary),
      description: String(body.description ?? current.description),
      sessionCredits: Number(body.sessionCreditCount ?? current.sessionCredits),
      pricePhp: Number(body.pricePhp ?? current.pricePhp),
      allActiveClasses:
        body.applicabilityMode === undefined
          ? current.applicability.allActiveClasses
          : body.applicabilityMode === "ALL_ACTIVE_CLASSES",
      classIds: (body.classIds as string[] | undefined) ?? current.applicability.classIds,
      validityDays:
        body.validityDays === undefined
          ? current.validityDays
          : (body.validityDays as number | null),
      perCustomerLimit:
        body.perCustomerLimit === undefined
          ? current.perCustomerLimit
          : (body.perCustomerLimit as number | null),
      status: current.status,
    });
    return { bundle: bundleWire(updated) } as never;
  }
  if (route === "/api/admin/package-acquisitions" && method === "GET") {
    const rows = await adapter.getAdminBundleAcquisitions();
    return {
      items: rows.map((row) => ({
        ...row,
        profileId: row.customerId,
        kind:
          row.channel === "ADMIN_GRANT"
            ? "ADMIN_GRANT"
            : row.channel === "SELF_CLAIM"
              ? "CUSTOMER_CLAIM"
              : "CUSTOMER_PAID",
        payment:
          row.channel === "SELF_PURCHASE"
            ? { amountPhp: row.pricePhp, method: "GCASH", status: "SUBMITTED" }
            : null,
      })),
    } as never;
  }

  if (route === "/api/admin/settings" && method === "GET") {
    return settingsWire(await adapter.getAdminSettings()) as never;
  }
  if (route === "/api/admin/settings" && method === "PATCH") {
    const body = init?.body as {
      section?: string;
      business?: { name?: string; phone?: string; address?: string };
      content?: { about?: string; email?: string };
    };
    const current = await adapter.getAdminSettings();
    const updated = await adapter.updateAdminSettings({
      ...current,
      businessName: body.business?.name ?? current.businessName,
      contact: {
        ...current.contact,
        phone: body.business?.phone ?? current.contact.phone,
        address: body.business?.address ?? current.contact.address,
        email: body.content?.email ?? current.contact.email,
      },
      about: body.content?.about ?? current.about,
    });
    return settingsWire(updated) as never;
  }
  if (route === "/api/admin/settings/faqs" && method === "POST") {
    const current = await adapter.getAdminSettings();
    const body = init?.body as { question: string; answer: string };
    const faq = { ...body, id: `faq-story-${Date.now()}`, sortOrder: current.faqs.length };
    await adapter.updateAdminSettings({ faqs: [...current.faqs, faq] });
    return { faq } as never;
  }
  const faq = /^\/api\/admin\/settings\/faqs\/([^/]+)$/.exec(route);
  if (faq && (method === "PATCH" || method === "DELETE")) {
    const current = await adapter.getAdminSettings();
    const next =
      method === "DELETE"
        ? current.faqs.filter((item) => item.id !== faq[1])
        : current.faqs.map((item) =>
            item.id === faq[1] ? { ...item, ...(init?.body as object) } : item,
          );
    await adapter.updateAdminSettings({ faqs: next });
    return method === "DELETE"
      ? ({ deleted: faq[1] } as never)
      : ({ faq: next.find((item) => item.id === faq[1]) } as never);
  }
  if (route === "/api/admin/settings/faqs/reorder" && method === "POST") {
    const current = await adapter.getAdminSettings();
    const { ids } = init?.body as { ids: string[] };
    const faqs = ids.flatMap((id, index) => {
      const item = current.faqs.find((row) => row.id === id);
      return item ? [{ ...item, sortOrder: index }] : [];
    });
    await adapter.updateAdminSettings({ faqs });
    return { faqs } as never;
  }
  if (route === "/api/admin/settings/payment-qrs" && method === "GET") {
    return (await adapter.listPaymentQrs(params.get("includeArchived") === "true")) as never;
  }
  if (route === "/api/admin/settings/payment-qrs" && method === "POST") {
    return { qr: await adapter.upsertPaymentQr(init?.body as never) } as never;
  }
  const paymentQr = /^\/api\/admin\/settings\/payment-qrs\/([^/]+)$/.exec(route);
  if (paymentQr && method === "PATCH") {
    const current = (await adapter.listPaymentQrs(true)).items.find((row) => row.id === paymentQr[1]);
    if (!current) throw new Error("Payment account not found in Storybook fixtures.");
    return {
      qr: await adapter.upsertPaymentQr({ ...current, ...(init?.body as object), id: current.id }),
    } as never;
  }
  if (paymentQr && method === "DELETE") {
    return { qr: await adapter.archivePaymentQr(paymentQr[1]) } as never;
  }
  const activateQr = /^\/api\/admin\/settings\/payment-qrs\/([^/]+)\/activate$/.exec(route);
  if (activateQr && method === "POST") {
    const body = init?.body as { active: boolean };
    return { qr: await adapter.setPaymentQrActive(activateQr[1], body.active) } as never;
  }
  if (route === "/api/admin/settings/policy-forms" && method === "GET") {
    const settings = await adapter.getAdminSettings();
    return { policyFormRequirements: settings.policyFormRequirements } as never;
  }
  if (route === "/api/admin/settings/policy-forms" && method === "PUT") {
    const { requirements } = init?.body as {
      requirements: Parameters<typeof adapter.setPolicyFormRequirements>[0];
    };
    const settings = await adapter.setPolicyFormRequirements(requirements);
    return { policyFormRequirements: settings.policyFormRequirements } as never;
  }
  if (route === "/api/admin/settings/policies" && method === "POST") {
    const body = init?.body as { title: string; version: string; body: string };
    return {
      policy: await adapter.upsertPolicyDocument({
        documentName: body.title,
        version: body.version,
        body: body.body,
        current: true,
      }),
    } as never;
  }
  const policyVersion = /^\/api\/admin\/settings\/policies\/([^/]+)\/versions$/.exec(route);
  if (policyVersion && method === "POST") {
    const current = await adapter.getAdminSettings();
    const policy = current.policyDocuments.find((item) => item.id === policyVersion[1]);
    if (!policy) throw new Error("Policy not found in Storybook fixtures.");
    const body = init?.body as { version: string; body: string };
    return {
      policy: await adapter.upsertPolicyDocument({
        documentName: policy.documentName,
        version: body.version,
        body: body.body,
        current: false,
      }),
    } as never;
  }
  const promotePolicy = /^\/api\/admin\/settings\/policies\/([^/]+)\/promote$/.exec(route);
  if (promotePolicy && method === "POST") {
    const current = await adapter.getAdminSettings();
    const policy = current.policyDocuments.find((item) => item.id === promotePolicy[1]);
    if (!policy) throw new Error("Policy not found in Storybook fixtures.");
    const body = init?.body as { version: string };
    return {
      settings: await adapter.promotePolicyVersion(policy.documentName, body.version),
    } as never;
  }
  const policy = /^\/api\/admin\/settings\/policies\/([^/]+)$/.exec(route);
  if (policy && method === "DELETE") {
    const current = await adapter.getAdminSettings();
    const settings = current.policyDocuments.some((item) => item.id === policy[1])
      ? await adapter.deletePolicyDocument(policy[1])
      : await adapter.deletePolicy(policy[1]);
    return { settings } as never;
  }

  if (route === "/api/admin/marketing-insights" && method === "GET") {
    return (await adapter.getAdminMarketingInsights({
      from: params.get("from") ?? "2026-01-01",
      to: params.get("to") ?? "2027-01-01",
    })) as never;
  }

  const bookingAction = /^\/api\/admin\/bookings\/([^/]+)\/(confirm|reject)$/.exec(route);
  if (bookingAction && method === "POST") {
    const result =
      bookingAction[2] === "confirm"
        ? await adapter.confirmAdminBooking(bookingAction[1])
        : await adapter.rejectAdminBooking(
            bookingAction[1],
            (init?.body as { reason?: string } | undefined)?.reason ?? "Not approved",
          );
    return { booking: bookingWire(result) } as never;
  }
  const paymentAction = /^\/api\/admin\/payments\/([^/]+)\/record-cash$/.exec(route);
  if (paymentAction && method === "POST") {
    return { booking: await adapter.recordCash(paymentAction[1]) } as never;
  }
  const paymentProof = /^\/api\/admin\/payment-proofs\/([^/]+)\/signed-url$/.exec(route);
  if (paymentProof && method === "GET") {
    const proof = await adapter.getAdminPaymentProofSignedUrl(paymentProof[1]);
    return { signedUrl: proof.url, expiresIn: 300 } as never;
  }
  const refundAction = /^\/api\/admin\/refunds\/([^/]+)\/(mark-pending|mark-refunded)$/.exec(route);
  if (refundAction && method === "POST") {
    const booking =
      refundAction[2] === "mark-pending"
        ? await adapter.markRefundPending(refundAction[1])
        : await adapter.markRefunded(refundAction[1]);
    return { booking } as never;
  }
  const cancellationAction =
    /^\/api\/admin\/cancellation-requests\/([^/]+)\/(complete|reject)$/.exec(route);
  if (cancellationAction && method === "POST") {
    const booking =
      cancellationAction[2] === "complete"
        ? await adapter.completeAdminCancellation(cancellationAction[1])
        : await adapter.rejectAdminCancellation(
            cancellationAction[1],
            (init?.body as { reason?: string } | undefined)?.reason ?? "Not approved",
          );
    return { booking } as never;
  }
  const rescheduleAction =
    /^\/api\/admin\/reschedule-requests\/([^/]+)\/(approve|reject)$/.exec(route);
  if (rescheduleAction && method === "POST") {
    const booking =
      rescheduleAction[2] === "approve"
        ? await adapter.approveAdminReschedule(rescheduleAction[1])
        : await adapter.rejectAdminReschedule(
            rescheduleAction[1],
            (init?.body as { reason?: string } | undefined)?.reason ?? "Not approved",
          );
    return { booking } as never;
  }

  const bundleAction = /^\/api\/admin\/bundles\/([^/]+)\/(publish|unpublish|archive)$/.exec(route);
  if (bundleAction && method === "POST") {
    const status =
      bundleAction[2] === "publish"
        ? "PUBLISHED"
        : bundleAction[2] === "archive"
          ? "ARCHIVED"
          : "DRAFT";
    const updated = await adapter.setAdminBundleStatus(bundleAction[1], status);
    const metrics = await adapter.getAdminBundleMetrics();
    return { bundle: bundleWire(updated, metrics[updated.id]) } as never;
  }
  const grantPackage = /^\/api\/admin\/customers\/([^/]+)\/packages\/grant$/.exec(route);
  if (grantPackage && method === "POST") {
    const body = init?.body as {
      bundleId: string;
      adminNote?: string;
      overrideLimit?: boolean;
    };
    const entitlement = await adapter.grantCustomerBundle({
      customerId: grantPackage[1],
      bundleId: body.bundleId,
      note: body.adminNote,
      overrideLimit: body.overrideLimit,
    });
    const acquisition = (await adapter.getAdminBundleAcquisitions()).find(
      (row) => row.id === entitlement.acquisitionId,
    );
    return { acquisition, entitlement, replayed: false } as never;
  }
  const revokePackage = /^\/api\/admin\/packages\/([^/]+)\/revoke$/.exec(route);
  if (revokePackage && method === "POST") {
    const body = init?.body as { reason: string };
    return {
      entitlement: await adapter.revokeCustomerEntitlement({
        entitlementId: revokePackage[1],
        reason: body.reason,
      }),
    } as never;
  }
  const acquisitionAction =
    /^\/api\/admin\/package-acquisitions\/([^/]+)\/(approve|reject)$/.exec(route);
  if (acquisitionAction && method === "POST") {
    if (acquisitionAction[2] === "approve") {
      return { entitlement: await adapter.approveBundleAcquisition(acquisitionAction[1]) } as never;
    }
    return {
      acquisition: await adapter.rejectBundleAcquisition(
        acquisitionAction[1],
        (init?.body as { reason?: string } | undefined)?.reason ?? "Not approved",
      ),
    } as never;
  }

  const eventAction = /^\/api\/admin\/events\/([^/]+)\/(publish|cancel|archive)$/.exec(route);
  if (eventAction && method === "POST") {
    const event =
      eventAction[2] === "publish"
        ? await adapter.publishAdminEvent(eventAction[1])
        : eventAction[2] === "cancel"
          ? await adapter.cancelAdminEvent(eventAction[1])
          : await adapter.archiveAdminEvent(eventAction[1]);
    return { event } as never;
  }
  if (route === "/api/admin/events" && method === "POST") {
    return { event: await adapter.createAdminEvent(init?.body as never) } as never;
  }
  if (event && method === "PATCH") {
    return { event: await adapter.updateAdminEvent(event[1], init?.body as never) } as never;
  }

  throw new Error(`Storybook entity fetcher: unhandled ${method} ${path}`);
};
