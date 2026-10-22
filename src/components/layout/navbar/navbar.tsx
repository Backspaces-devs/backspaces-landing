"use client";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";

import {
  NAVBAR_DESKTOP_MEDIA_QUERY,
  navigationConfig,
} from "@/config/navigation";

import { Brand } from "./brand";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationLink } from "./navigation-link";
import "./navbar.css";

export function Navbar() {
  // Your repo enables Cache Components. This also supports future dynamic routes
  // where usePathname cannot resolve until request time.
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarContent() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogId = useId();
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia(NAVBAR_DESKTOP_MEDIA_QUERY);
    const handleChange = () => {
      if (query.matches) setMobileOpen(false);
    };

    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <header className="bs-nav-header">
        <div className="bs-nav-header-inner">
          <Brand onNavigate={closeMobile} />
          <DesktopNavigation pathname={pathname} />

          <button
            type="button"
            className="bs-nav-menu-button bs-nav-mobile-toggle"
            aria-label={navigationConfig.accessibility.openMenuLabel}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-controls={dialogId}
            onClick={() => setMobileOpen(true)}
          >
            <MenuGlyph />
          </button>
        </div>
      </header>

      <MobileNavigation
        id={dialogId}
        open={mobileOpen}
        pathname={pathname}
        onClose={closeMobile}
      />
    </>
  );
}

function NavbarFallback() {
  return (
    <header className="bs-nav-header">
      <div className="bs-nav-header-inner">
        <Brand />
        <nav
          className="bs-nav-desktop-nav"
          aria-label={navigationConfig.accessibility.desktopLabel}
        >
          <ul className="bs-nav-desktop-list">
            {navigationConfig.items.map((item) => (
              <li key={item.id} className="bs-nav-desktop-item">
                <NavigationLink
                  href={item.href}
                  external={item.external}
                  className="bs-nav-top-link"
                >
                  {item.label}
                </NavigationLink>
              </li>
            ))}
          </ul>
        </nav>
        <span
          className="bs-nav-menu-button bs-nav-mobile-toggle"
          aria-hidden="true"
        >
          <MenuGlyph />
        </span>
      </div>
    </header>
  );
}

function MenuGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M3 6.5H17M3 13.5H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
