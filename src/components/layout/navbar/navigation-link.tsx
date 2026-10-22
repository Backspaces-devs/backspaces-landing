import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

import { navigationConfig } from "@/config/navigation";

type NavigationLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  external?: boolean;
};

export function isExternalLink(href: string, external?: boolean) {
  return external ?? /^https?:\/\//i.test(href);
}

export function isNavigationActive(pathname: string, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return false;

  const target = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const current = pathname.replace(/\/$/, "") || "/";

  return target === "/"
    ? current === "/"
    : current === target || current.startsWith(`${target}/`);
}

export function NavigationLink({
  href,
  external,
  children,
  ...props
}: NavigationLinkProps) {
  if (isExternalLink(href, external)) {
    return (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="bs-nav-sr-only">
          {` (${navigationConfig.accessibility.externalLinkHint})`}
        </span>
      </a>
    );
  }

  return (
    <Link {...props} href={href}>
      {children}
    </Link>
  );
}
