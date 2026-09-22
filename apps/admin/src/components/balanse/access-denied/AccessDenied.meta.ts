export type AccessDeniedKind = "forbidden" | "revoked" | "denied";

export type AccessDeniedProps = {
  kind: AccessDeniedKind;
  /** Optional first permitted destination for staff who can open another page. */
  homeHref?: string | null;
};
