import type {
  AdminClass,
  AdminCoach,
  AdminRosterPerson,
  AdminSession,
  AdminVenue,
  CountRow,
  CustomerBooking,
  CustomerOnboardingAnswers,
  CustomerProfile,
  CustomerProfilePatch,
  CustomerReferralSummary,
  MarketingInsights,
  MarketingInsightsQuery,
  OnboardingStatus,
  PublicEventPage,
  PublicRoster,
  PublicRosterAttendee,
  PublicSession,
  PublicSessionPage,
  ShareParams,
} from "@balanse/domain";
import {
  AVATAR_MAX_BYTES,
  EMPTY_ONBOARDING_ANSWERS,
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  getDisplayName,
  getInitials,
  HEARD_FROM_OPTIONS,
  isAvatarMimeType,
  joinFullName,
  NICKNAME_MAX,
  NICKNAME_MIN,
  ONBOARDING_OTHER_MAX,
  PERSON_NAME_MAX,
  PUBLIC_ROSTER_STATUSES,
  parseShareParams,
  REFERRAL_CHANNEL_LABELS,
  REFERRAL_CHANNELS,
  splitFullName,
  toReferralChannel,
} from "@balanse/domain";
import type { ReferralFixture } from "./community-fixtures";
import type { StoredSessionEvent } from "./event-fixtures";

export type CommunityState = {
  onboarding: Record<string, CustomerOnboardingAnswers>;
  referrals: Record<string, ReferralFixture>;
  signupAt: Record<string, string>;
};

export class CommunityMockError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_profile" | "invalid_avatar" | "not_found",
  ) {
    super(message);
    this.name = "CommunityMockError";
  }
}

/* ------------------------------------------------------------------ */
/* Public session / event pages                                        */
/* ------------------------------------------------------------------ */

export type PublicPageContext = {
  classes: readonly AdminClass[];
  coaches: readonly AdminCoach[];
  venues: readonly AdminVenue[];
  events: readonly StoredSessionEvent[];
};

export function buildPublicSessionPage(
  session: AdminSession,
  asPublic: PublicSession,
  ctx: PublicPageContext,
): PublicSessionPage {
  const cls = ctx.classes.find((row) => row.id === session.classId);
  const venue = ctx.venues.find((row) => row.id === session.venueId);
  const event = ctx.events.find(
    (row) =>
      row.sessionId === session.id && (row.status === "PUBLISHED" || row.status === "CANCELLED"),
  );
  return {
    ...asPublic,
    classSlug: cls?.slug ?? "session",
    classShortDescription: cls?.shortDescription ?? "",
    heroImage: cls?.heroImage ?? null,
    venue: venue ? { name: venue.name, address: venue.address } : null,
    coachesDetailed: session.coaches.map((assigned) => {
      const coach = ctx.coaches.find((row) => row.id === assigned.id);
      return {
        id: assigned.id,
        name: coach?.name ?? assigned.name,
        photoKey: coach?.photoKey ?? assigned.photoKey,
        specialties: coach ? [...coach.specialties] : [],
      };
    }),
    event: event ? { id: event.id, title: event.title, status: event.status } : null,
  };
}

export function buildPublicEventPage(
  event: StoredSessionEvent,
  sessionPage: PublicSessionPage,
): PublicEventPage {
  const cancelled = event.status === "CANCELLED" || sessionPage.status === "CANCELLED";
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    description: event.description,
    posterImage: event.posterImage,
    galleryImages: [...event.galleryImages],
    beneficiary: event.beneficiary,
    whatToBring: event.whatToBring,
    registrationOpensAt: event.registrationOpensAt,
    registrationClosesAt: event.registrationClosesAt,
    status: cancelled ? "CANCELLED" : "PUBLISHED",
    session: sessionPage,
  };
}

/* ------------------------------------------------------------------ */
/* Public roster — mirrors app_public.public_session_roster (#345)     */
/* ------------------------------------------------------------------ */

function opaqueKey(...parts: string[]): string {
  let hash = 2166136261;
  for (const char of parts.join("|")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `r${hash.toString(36)}`;
}

type Identity = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  avatarUrl: string | null;
  showOnPublicRoster: boolean;
};

function identityFor(booking: CustomerBooking, profiles: readonly CustomerProfile[]): Identity {
  const profile = profiles.find((row) => row.id === booking.customerId);
  if (profile) {
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
      showOnPublicRoster: profile.showOnPublicRoster,
    };
  }
  return {
    ...splitFullName(booking.customerName),
    nickname: null,
    avatarUrl: null,
    showOnPublicRoster: true,
  };
}

/** One row per customer: earliest going booking wins. */
function goingBookings(sessionId: string, bookings: readonly CustomerBooking[]): CustomerBooking[] {
  const statuses = PUBLIC_ROSTER_STATUSES as readonly string[];
  const byCustomer = new Map<string, CustomerBooking>();
  for (const booking of [...bookings].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (booking.sessionId !== sessionId || !statuses.includes(booking.status)) continue;
    if (!byCustomer.has(booking.customerId)) byCustomer.set(booking.customerId, booking);
  }
  return [...byCustomer.values()];
}

export function buildPublicRoster(input: {
  session: PublicSession;
  bookings: readonly CustomerBooking[];
  profiles: readonly CustomerProfile[];
  viewerCustomerId: string | null;
}): PublicRoster {
  const going = goingBookings(input.session.id, input.bookings);
  const goingCount = going.length;
  const spotsLeft = Math.max(0, input.session.remainingSlots);
  if (!input.viewerCustomerId) return { visibility: "counts", goingCount, spotsLeft };

  let hiddenCount = 0;
  const attendees: PublicRosterAttendee[] = [];
  for (const booking of going) {
    const identity = identityFor(booking, input.profiles);
    const isSelf = booking.customerId === input.viewerCustomerId;
    if (!identity.showOnPublicRoster && !isSelf) {
      hiddenCount += 1;
      continue;
    }
    attendees.push({
      key: opaqueKey(booking.id, input.session.id),
      displayName: getDisplayName(identity),
      avatarUrl: identity.avatarUrl,
      initials: getInitials(identity),
      isSelf,
      ...(isSelf && !identity.showOnPublicRoster ? { hiddenFromOthers: true } : {}),
    });
  }
  attendees.sort((a, b) => Number(b.isSelf) - Number(a.isSelf));
  return { visibility: "list", goingCount, spotsLeft, hiddenCount, attendees };
}

/* ------------------------------------------------------------------ */
/* Admin roster people / customer detail                               */
/* ------------------------------------------------------------------ */

export function buildAdminRosterPeople(
  bookings: readonly CustomerBooking[],
  profiles: readonly CustomerProfile[],
  state: CommunityState,
): Record<string, AdminRosterPerson> {
  const people: Record<string, AdminRosterPerson> = {};
  for (const booking of bookings) {
    if (people[booking.customerId]) continue;
    const identity = identityFor(booking, profiles);
    people[booking.customerId] = {
      customerId: booking.customerId,
      firstName: identity.firstName,
      lastName: identity.lastName,
      nickname: identity.nickname,
      avatarUrl: identity.avatarUrl,
      showOnPublicRoster: identity.showOnPublicRoster,
      onboarding: state.onboarding[booking.customerId]
        ? structuredClone(state.onboarding[booking.customerId])
        : null,
    };
  }
  return people;
}

export function customerReferralSummary(
  customerId: string,
  profiles: readonly CustomerProfile[],
  state: CommunityState,
): CustomerReferralSummary {
  const own = state.referrals[customerId];
  const referrer = own?.referredById
    ? profiles.find((row) => row.id === own.referredById)
    : undefined;
  const referrals = Object.entries(state.referrals)
    .filter(([, row]) => row.referredById === customerId)
    .map(([id]) => profiles.find((row) => row.id === id))
    .filter((row): row is CustomerProfile => Boolean(row))
    .map((row) => ({ id: row.id, fullName: row.fullName }));
  return {
    referredBy: referrer ? { id: referrer.id, fullName: referrer.fullName } : null,
    channel: own?.channel ?? null,
    referrals,
  };
}

/* ------------------------------------------------------------------ */
/* Profile writes                                                      */
/* ------------------------------------------------------------------ */

function cleanName(value: string, label: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) throw new CommunityMockError(`${label} is required.`, "invalid_profile");
  if (trimmed.length > PERSON_NAME_MAX) {
    throw new CommunityMockError(
      `${label} must be ${PERSON_NAME_MAX} characters or fewer.`,
      "invalid_profile",
    );
  }
  return trimmed;
}

export function applyProfilePatch(profile: CustomerProfile, patch: CustomerProfilePatch): void {
  if (patch.firstName !== undefined) profile.firstName = cleanName(patch.firstName, "First name");
  if (patch.lastName !== undefined) profile.lastName = cleanName(patch.lastName, "Last name");
  if (patch.nickname !== undefined) {
    const nickname = patch.nickname?.trim().replace(/\s+/g, " ") ?? "";
    if (nickname && (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX)) {
      throw new CommunityMockError(
        `Nickname must be ${NICKNAME_MIN}–${NICKNAME_MAX} characters.`,
        "invalid_profile",
      );
    }
    profile.nickname = nickname || null;
  }
  if (patch.email !== undefined) profile.email = patch.email.trim();
  if (patch.contactNumber !== undefined) profile.contactNumber = patch.contactNumber.trim();
  if (patch.showOnPublicRoster !== undefined) {
    profile.showOnPublicRoster = patch.showOnPublicRoster;
  }
  profile.fullName = joinFullName(profile);
}

const DATA_URL_RE = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/;

export function validateAvatarDataUrl(dataUrl: string): void {
  const match = DATA_URL_RE.exec(dataUrl);
  if (!match || !isAvatarMimeType(match[1] ?? "")) {
    throw new CommunityMockError("Use a JPG, PNG or WEBP image.", "invalid_avatar");
  }
  const bytes = Math.floor(((match[2]?.length ?? 0) * 3) / 4);
  if (bytes > AVATAR_MAX_BYTES) {
    throw new CommunityMockError("Photo must be 5 MB or smaller.", "invalid_avatar");
  }
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(taken: ReadonlySet<string>, seed: string): string {
  let state = 0;
  for (const char of seed) state = (state * 33 + char.charCodeAt(0)) >>> 0;
  for (;;) {
    let code = "";
    for (let index = 0; index < 8; index += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      code += CODE_ALPHABET[state % CODE_ALPHABET.length];
    }
    if (!taken.has(code)) return code;
  }
}

/** Resolves sign-up attribution. Unknown or self codes are ignored; never throws. */
export function resolveSignupAttribution(
  attribution: ShareParams | undefined,
  profiles: readonly CustomerProfile[],
  selfEmail: string,
): ReferralFixture | null {
  const params = parseShareParams({
    ref: attribution?.ref ?? null,
    src: attribution?.src ?? null,
    via: attribution?.via ?? null,
  });
  let referredById: string | null = null;
  if (params.ref) {
    const referrer = profiles.find((row) => row.referralCode === params.ref);
    if (referrer && referrer.email.toLowerCase() !== selfEmail.toLowerCase()) {
      referredById = referrer.id;
    } else {
      delete params.ref;
    }
  }
  const channel = toReferralChannel(params);
  return channel ? { referredById, channel } : null;
}

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

function clip(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

export function mergeOnboarding(
  current: CustomerOnboardingAnswers | undefined,
  patch: Partial<CustomerOnboardingAnswers>,
  nowIso: string,
): CustomerOnboardingAnswers {
  const base = current ? structuredClone(current) : structuredClone(EMPTY_ONBOARDING_ANSWERS);
  const next: CustomerOnboardingAnswers = {
    ...base,
    ...patch,
    goals: patch.goals ? [...new Set(patch.goals)] : base.goals,
    interestClassIds: patch.interestClassIds
      ? [...new Set(patch.interestClassIds)]
      : base.interestClassIds,
    updatedAt: nowIso,
  };
  next.goalsOther = next.goals.includes("OTHER") ? clip(next.goalsOther, ONBOARDING_OTHER_MAX) : "";
  next.interestsOther = clip(next.interestsOther, ONBOARDING_OTHER_MAX);
  next.heardFromOther =
    next.heardFrom === "OTHER" ? clip(next.heardFromOther, ONBOARDING_OTHER_MAX) : "";
  return next;
}

/* ------------------------------------------------------------------ */
/* Marketing insights — counts only                                    */
/* ------------------------------------------------------------------ */

function countRows<T extends string>(
  options: readonly { value: T; label: string }[],
  counts: Map<T, number>,
): CountRow<T>[] {
  return options.map((option) => ({
    key: option.value,
    label: option.label,
    count: counts.get(option.value) ?? 0,
  }));
}

function bump<T>(map: Map<T, number>, key: T): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function buildMarketingInsights(input: {
  profiles: readonly CustomerProfile[];
  classes: readonly AdminClass[];
  state: CommunityState;
  query: MarketingInsightsQuery;
}): MarketingInsights {
  const from = Date.parse(input.query.from);
  const to = Date.parse(input.query.to);
  const inRange = input.profiles.filter((profile) => {
    const at = input.state.signupAt[profile.id];
    if (!at) return false;
    const time = Date.parse(at);
    return time >= from && time <= to;
  });

  const onboarding: Record<OnboardingStatus, number> = {
    not_started: 0,
    in_progress: 0,
    skipped: 0,
    completed: 0,
  };
  const heardFrom = new Map<(typeof HEARD_FROM_OPTIONS)[number]["value"], number>();
  const heardOther = new Map<string, number>();
  const goals = new Map<(typeof FITNESS_GOAL_OPTIONS)[number]["value"], number>();
  const experience = new Map<(typeof EXPERIENCE_LEVEL_OPTIONS)[number]["value"], number>();
  const interests = new Map<string, number>();
  const channels = new Map<(typeof REFERRAL_CHANNELS)[number] | "NONE", number>();
  let goalRespondents = 0;
  let sharedLinkSignups = 0;

  for (const profile of inRange) {
    onboarding[profile.onboardingStatus] += 1;
    const referral = input.state.referrals[profile.id];
    if (referral) sharedLinkSignups += 1;
    bump(channels, referral?.channel ?? "NONE");
    const answers = input.state.onboarding[profile.id];
    if (!answers) continue;
    if (answers.heardFrom) bump(heardFrom, answers.heardFrom);
    if (answers.heardFrom === "OTHER" && answers.heardFromOther.trim()) {
      bump(heardOther, answers.heardFromOther.trim().toLowerCase());
    }
    if (answers.goals.length > 0) goalRespondents += 1;
    for (const goal of answers.goals) bump(goals, goal);
    if (answers.experienceLevel) bump(experience, answers.experienceLevel);
    for (const classId of answers.interestClassIds) bump(interests, classId);
  }

  return {
    range: { from: input.query.from, to: input.query.to },
    signups: inRange.length,
    onboarding,
    sharedLinkSignups,
    heardFrom: countRows(HEARD_FROM_OPTIONS, heardFrom),
    heardFromOther: [...heardOther.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
      .slice(0, 20),
    goals: countRows(FITNESS_GOAL_OPTIONS, goals),
    goalRespondents,
    experience: countRows(EXPERIENCE_LEVEL_OPTIONS, experience),
    interests: [...interests.entries()]
      .map(([classId, count]) => {
        const cls = input.classes.find((row) => row.id === classId);
        return { classId, label: cls?.name ?? classId, active: cls?.active ?? false, count };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    referralChannels: [
      ...REFERRAL_CHANNELS.map((channel) => ({
        key: channel,
        label: REFERRAL_CHANNEL_LABELS[channel],
        count: channels.get(channel) ?? 0,
      })),
      { key: "NONE" as const, label: "No shared link", count: channels.get("NONE") ?? 0 },
    ],
  };
}
