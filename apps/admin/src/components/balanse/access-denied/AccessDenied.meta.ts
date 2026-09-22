export type AccessDeniedKind = "forbidden" | "revoked" | "denied" | "ownership";

export type AccessDeniedProps = {
  kind: AccessDeniedKind;
  /** Optional first permitted destination for staff who can open another page. */
  homeHref?: string | null;
};
