"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";

import { navigationConfig } from "@/config/navigation";

import { Brand } from "./brand";
import {
  isExternalLink,
  isNavigationActive,
  NavigationLink,
} from "./navigation-link";

interface MobileNavigationProps {
  id: string;
  open: boolean;
  pathname: string;
  onClose: () => void;
}

export function MobileNavigation({
  id,
  open,
  pathname,
  onClose,
}: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    // Native modal dialogs make the background inert and contain keyboard focus.
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    contentRef.current?.scrollTo({ top: 0 });

    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPadding = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const existingPadding =
      Number.parseFloat(getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${existingPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPadding;
      html.style.overflow = previousHtmlOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const additionalGroups = navigationConfig.items.flatMap((item) =>
    (item.megaMenu?.groups ?? [])
      .filter((group) => group.showOnMobile !== false)
      .map((group) => ({ ...group, key: `${item.id}-${group.id}` }))
  );

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className="bs-nav-mobile-dialog"
      aria-label={navigationConfig.accessibility.mobileLabel}
      aria-modal="true"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (element) =>
            element.getClientRects().length > 0 &&
            element.getAttribute("aria-disabled") !== "true"
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Ignore a queued close event if the dialog has already reopened.
        if (!dialogRef.current?.open) onClose();
      }}
    >
      <div className="bs-nav-mobile-header">
        <Brand onNavigate={onClose} />
        <button
          ref={closeRef}
          type="button"
          className="bs-nav-menu-button"
          aria-label={navigationConfig.accessibility.closeMenuLabel}
          onClick={onClose}
        >
          <X aria-hidden="true" size={21} strokeWidth={1.5} />
        </button>
      </div>

      <nav
        ref={contentRef}
        className="bs-nav-mobile-content"
        aria-label={navigationConfig.accessibility.mobileLabel}
      >
        <section
          className="bs-nav-mobile-group"
          aria-labelledby={`${id}-primary-heading`}
        >
          <h2
            id={`${id}-primary-heading`}
            className="bs-nav-mobile-group-title"
          >
            {navigationConfig.mobile.primaryGroupLabel}
          </h2>
          <ul className="bs-nav-mobile-list">
            {navigationConfig.items.map((item) => {
              const active = isNavigationActive(pathname, item.href);
              return (
                <li key={item.id}>
                  <NavigationLink
                    href={item.href}
                    external={item.external}
                    className="bs-nav-mobile-link"
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span aria-hidden="true" className="bs-nav-current-dot" />
                    )}
                  </NavigationLink>
                </li>
              );
            })}
          </ul>
        </section>

        {additionalGroups.map((group) => (
          <section
            key={group.key}
            className="bs-nav-mobile-group"
            aria-labelledby={`${id}-${group.key}-heading`}
          >
            <h2
              id={`${id}-${group.key}-heading`}
              className="bs-nav-mobile-group-title"
            >
              {group.label}
            </h2>
            <ul className="bs-nav-mobile-list">
              {group.links.map((link) => {
                const external = isExternalLink(link.href, link.external);
                return (
                  <li key={link.id}>
                    <NavigationLink
                      href={link.href}
                      external={link.external}
                      className="bs-nav-mobile-link"
                      aria-current={
                        !external && isNavigationActive(pathname, link.href)
                          ? "page"
                          : undefined
                      }
                      onClick={onClose}
                    >
                      <span>{link.label}</span>
                      {external && (
                        <ArrowUpRight aria-hidden="true" size={19} />
                      )}
                    </NavigationLink>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="bs-nav-mobile-footer">
          {navigationConfig.mobile.footerText}
        </p>
      </nav>
    </dialog>
  );
}
