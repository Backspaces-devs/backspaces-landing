import Image from "next/image";
import Link from "next/link";

import { navigationConfig } from "@/config/navigation";

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  const { brand } = navigationConfig;

  return (
    <Link
      href={brand.href}
      aria-label={brand.accessibleLabel}
      className="bs-nav-brand"
      onClick={onNavigate}
    >
      {brand.logoSrc ? (
        <Image
          src={brand.logoSrc}
          alt=""
          width={28}
          height={28}
          className="bs-nav-brand-mark"
        />
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 28 28"
          fill="none"
          className="bs-nav-brand-mark"
        >
          <path
            d="M11.25 5.75H23.25C24.35 5.75 25.25 6.65 25.25 7.75V20.25C25.25 21.35 24.35 22.25 23.25 22.25H11.25L3 14L11.25 5.75Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 10.5L20.5 17.5M20.5 10.5L13.5 17.5"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span>{brand.name}</span>
    </Link>
  );
}
