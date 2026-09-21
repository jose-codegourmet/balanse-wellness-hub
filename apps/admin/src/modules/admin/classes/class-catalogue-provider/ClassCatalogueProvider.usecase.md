# Class catalogue provider

## Purpose
Inject server-side, RLS-protected catalogue operations into the class editor and list. Stories use the mock adapter when no provider is present.
## When to use
Class catalogue routes only.
## When NOT to use
Bookings, sessions and other mock screens.
## Examples
The class route layout loads initial data and passes server actions.
## Gotchas
The mock role cookie never authorizes a database write. Only a validated Supabase user linked to an active administrator can save.

See [component guide](../../../../../../../../docs/component-guide.md).
