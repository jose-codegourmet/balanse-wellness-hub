# OpenSpec — FE shared systems (FE-SHR-001–005)

## Why

Public, customer, and admin screens share navigation, status language, empty/error treatments, marketing imagery, and the booking calendar. Those systems must exist before FE-PUB / FE-CUS / FE-ADM page tickets.

## What

- Three nav catalogs (public, customer, admin) with active state, mobile menus, and guest/customer header swap
- 14-row status map + badge surfaces (customer chip, admin table cell)
- 15 enumerated empty/error states and localized skeletons
- Asset manifest consumer, aspect-ratio frames, coach photo fallback to ASSET-014
- Responsive mock calendar (day / week / month) wired on landing + portal schedule

## Out of scope

Live Supabase/API, Higgsfield generation, FE-PUB/CUS/ADM screen content beyond mounting these systems, WIRE-012 Storage URLs.
