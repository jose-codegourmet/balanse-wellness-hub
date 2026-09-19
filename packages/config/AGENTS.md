# Agent Instructions — `packages/config`

Local agent instructions for the shared config package placeholder.

---

## Scope

`packages/config` (`@balanse/config`) is currently a placeholder. It contains only a `package.json` with no exports, no source code, no dependencies, and no consumers.

- **Workspace name**: `@balanse/config`
- **Filter**: `pnpm --filter @balanse/config`
- **Package name**: `@balanse/config`

---

## Current state

```json
{
  "name": "@balanse/config",
  "version": "0.0.1",
  "private": true
}
```

There are no scripts, no entry points, and no published artifacts.

---

## Restrictions

- Do not add dependencies or source code here without a documented plan.
- Do not add exports that are not intended to be shared by multiple apps or packages.
- If you need to add shared config (e.g., a Biome config, shared ESLint config, or TypeScript base config), first update this package's `README.md` and `docs/README.md`, then update `docs/architecture.md` and `docs/dependency-guidelines.md` to reflect the new consumers.

---

## Common task routing

If a task requires shared config that would naturally live here, read `docs/dependency-guidelines.md` first, then create a plan and update the relevant docs before adding code.

---

## Documentation maintenance

Update this file when `packages/config` gains real exports, consumers, or scripts.
