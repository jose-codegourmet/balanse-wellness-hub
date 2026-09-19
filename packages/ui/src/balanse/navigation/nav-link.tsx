export type NavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
};

/**
 * Router-agnostic link slot. Apps inject `next/link`; Storybook and tests fall
 * back to a plain anchor.
 */
export type NavLinkComponent = (props: NavLinkProps) => React.ReactNode;

export const DefaultNavLink: NavLinkComponent = ({
  href,
  className,
  children,
  onClick,
  ...rest
}) => (
  <a href={href} className={className} onClick={onClick} aria-current={rest["aria-current"]}>
    {children}
  </a>
);
