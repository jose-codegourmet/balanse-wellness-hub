# Storybook data fixtures

`@balanse/mock` provides browser-local fixture data for the web and admin Storybooks. It is a development dependency of both apps and must not be imported by application routes, providers, or production React Query code. Stories, their `.stories-data.ts` companions, and `.storybook/` fetchers may use `getMockAdapter()`, fixtures, the fixed clock, runtime knobs, and mock principals.

Application data flows through `@balanse/api-client` to `/api/*` with the signed-in Supabase session. The database seeder also imports selected fixtures to construct demo rows; it is a development command, not application runtime.
