# OpenSpec — FE customer screens (FE-CUS-001–013)

## Why

Public mocks are on main. Customers still need the authenticated booking loop as mocked UI: account, schedule, reserve, pay, and requests.

## What

- Login, sign-up, and forgot-password with mock principals and `returnTo`
- Portal home, profile, achievements placeholder, and customer schedule
- Booking form → payment method → GCash proof or counter instructions
- Booking detail plus cancellation and reschedule request screens
- Storybook coverage for the required states; data only through `getMockAdapter()`

## Out of scope

Real Supabase Auth, Storage, email, admin request resolution, invented OQ-1/2/3/4/8/9 product rules.
