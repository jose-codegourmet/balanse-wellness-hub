# Web app

Public and customer mocks. Use `getMockAdapter()`. Jabkit wrappers belong in `src/components/balanse`.

## Read order

Follow the root `AGENTS.md` order and stop once the picture is clear:

1. **OpenSpec** — `openspec/specs/fe-public-screens.md`, `openspec/specs/fe-customer-screens.md`, plus `fe-shared-systems` / `fe-foundation` when the work crosses them. Check `openspec/changes/` if a matching change is in flight.
2. **`Component.meta.ts`** — colocated in the component folder. If it already explains the component, do not skim `Component.tsx`.
3. **Implementation** — only when the meta is missing, stale, or does not answer the question.

Screen-spec details live in `docs/screen-specs/public/` and `docs/screen-specs/customer/` after OpenSpec.
