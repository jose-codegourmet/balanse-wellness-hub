# Customer Portal — Packages (BE-058 / #290)

```text
MY PACKAGES
Owned entitlements: name | sessions remaining | held | used | expires
Pending paid requests: awaiting payment / review

[Browse packages]  [Package detail]
```

Required states: loading, none owned, available to claim, limit reached, awaiting payment/review, active, exhausted, expired, revoked, mock/backend failure, mobile.

Detail shows redemption history (held / consumed / restored). Restored credits after expiry appear in history; the entitlement stays unusable while expired.

Suggested routes: `/portal/packages`, `/portal/packages/[entitlementId]`. Query layer + `MockDataAdapter` only.
