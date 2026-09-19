# 01 — Product Context

## Business

Balanse is a wellness gym operated by Coach Rex and his team. The gym offers multiple instructor-led wellness and fitness classes such as yoga, boxing, capoeira, and other class types.

The initial operation is small, with approximately five coaches.

## Current business problem

The client identified two primary operational problems:

1. **Booking is too manual.**
2. **Customers lack transparent schedule and availability information.**

Customers need an easy way to answer:

- What classes are available on a given day?
- What time does each class start?
- Which coach is assigned?
- How many slots remain?
- Can I still reserve this session?

Balanse also wants to avoid maintaining separate paper, chat, or walk-in booking records.

## Product goal

The MVP should make the entire booking process flow through one centralized system.

The desired behavior is:

- Customer discovers a class from a calendar.
- Customer signs in or registers.
- Customer reserves using their own identity.
- Customer completes the required booking form and policies.
- Customer chooses an MVP payment method.
- The system holds the slot for a limited time.
- Admin verifies/accepts the booking.
- Customer can see the resulting booking status in their account.
- Admin checks the customer in when they arrive.

## MVP philosophy

The first release must remain intentionally lean.

The MVP is primarily a **proof of concept for the booking experience**, not a complete gym management platform.

The central validation question is:

> Does a calendar-first, centralized booking flow make it significantly easier for Balanse customers to discover and reserve classes while reducing manual booking work for the owners?

## Single source of truth

**CONFIRMED:** All reservations should exist in Balanse.

This includes:

- customers booking from home,
- returning customers,
- first-time customers,
- physical walk-ins.

A physical walk-in should not bypass the system. The expected flow is to scan a QR code, create/sign into an account, and reserve through the same inventory used by online customers.

## Business ownership

The initial admins are:

- Coach Rex
- Coach Rex's wife

Coaches are operational resources in the MVP, but are not expected to manage their own schedules through a coach portal.

## Payment philosophy

Automated payment processing is intentionally deferred.

MVP payment is manual through:

- GCash with proof-of-payment upload
- Cash / Pay at Counter

The system records booking/payment state, while actual money verification and refunds remain manual operations.

## Success characteristics

A successful MVP should provide:

- clear class availability,
- centralized booking records,
- predictable capacity handling,
- reduced paper/manual scheduling,
- a simple customer account history,
- a manageable admin workflow for Rex and his wife,
- enough operational structure to later add automated payments and recurring schedules.

## Financial visibility

Balanse should also provide basic internal operational visibility into:

- sales,
- refunds,
- coach costs,
- class-capacity utilization,
- attendance/no-shows.

These are operational reports for Coach Rex/admin and are not intended to replace formal accounting software.
