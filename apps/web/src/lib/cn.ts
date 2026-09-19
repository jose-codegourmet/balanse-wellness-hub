/**
 * Some Jabkit registry components import `cn` from `@/lib/cn` rather than the
 * kit-local path. This alias satisfies that contract without patching vendored
 * sources; both entry points resolve to the same implementation.
 */
export { cn } from "./utils";
