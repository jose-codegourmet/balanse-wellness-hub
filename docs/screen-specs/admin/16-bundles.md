# Admin — Bundle catalogue (BE-058 / #290)

```text
BUNDLES / PACKAGES
List: name | credits | price | status | limit

NEW / EDIT
Name | slug | summary | description
Session-credit count (integer > 0)
PHP price (0 allowed)
Applicability: all active classes | explicit class set
Optional validity days
Optional per-customer acquisition limit
[Save draft] [Publish] [Unpublish] [Archive]
```

Editing changes **future** acquisitions only. Archive blocks new claims; existing entitlements stay valid.

Customer detail: grant published bundle (note required for limit override). Paid-acquisition review: approve activates entitlement; reject does not.

Destructive/history actions need confirmation copy. FE owns screens. Suggested routes: `/bundles`, `/bundles/new`, `/bundles/[bundleId]`.
