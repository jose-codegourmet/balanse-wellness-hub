# Mock harness removal (WIRE-E03)

The web calendar scenario switcher and its `MockSessionHarness` were removed in WIRE-0304. Both apps use Supabase Auth for application sessions, and the env examples no longer advertise `NEXT_PUBLIC_ENABLE_MOCK_HARNESS` or `NEXT_PUBLIC_APP_MODE`.

`@balanse/mock` remains a development dependency for Storybook fixtures, mock principals, and in-browser API fetchers. Application routes and components use typed `@balanse/api-client` functions. Storybook controls scenarios through story parameters and decorators rather than a production shell harness.
