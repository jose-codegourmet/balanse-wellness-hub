# 04 — Authentication and Customer Profile

## Authentication provider

Preferred MVP platform: **Supabase Auth**.

Preferred customer experience:

1. Google sign-in
2. Email/password as an alternative/fallback

Google authentication is preferred because it reduces friction for walk-ins and first-time customers.

## Account requirement

**CONFIRMED:** A customer must have an account before reserving a class.

Guests may browse, but reservation requires authentication.

## One customer, one identity

A booking belongs to the authenticated account that creates it.

The system should not present a "booking for someone else" flow in MVP.

## Customer profile

The profile should hold the reusable personal details required by the booking process.

The exact required fields are still subject to Coach Rex's operational needs, but likely include:

- full name,
- email,
- contact number,
- other required customer information defined by the gym.

## Booking form prefill

When a returning customer books:

- known profile details should be prefilled,
- the customer should not repeatedly re-enter their name/details unless a field must be updated,
- policy/waiver acceptance must still occur when required by the applicable policy version.

## Walk-in account behavior

A walk-in customer should:

1. Scan the Balanse QR code.
2. Open the booking app.
3. Register/sign in if needed.
4. Reserve the desired class through the normal booking flow.

The physical presence of the customer does not create an exception to the account requirement.

## Privacy boundary

Customers should only be able to access their own:

- profile,
- bookings,
- payment submissions,
- cancellation/reschedule requests.

Admin access is broader for operational needs.
