"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";

import {
  NAVBAR_DESKTOP_MEDIA_QUERY,
  navigationConfig,
} from "@/config/navigation";

import { NavigationIcon } from "./navigation-icon";
import {
  isExternalLink,
  isNavigationActive,
  NavigationLink,
} from "./navigation-link";

export function DesktopNavigation({ pathname }: { pathname: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const closeTimer = useRef<number | null>(null);
  const openReason = useRef<"hover" | "click" | "keyboard" | null>(null);
  const baseId = useId();

  function cancelClose() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function closeMenu(restoreFocus = false) {
    cancelClose();
    if (restoreFocus && openId) triggerRefs.current.get(openId)?.focus();
    openReason.current = null;
    setOpenId(null);
  }

  function scheduleClose(id: string) {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      // Do not dismiss a menu that someone is navigating with the keyboard.
      if (panelRefs.current.get(id)?.contains(document.activeElement)) return;
      setOpenId((current) => (current === id ? null : current));
    }, navigationConfig.behavior.hoverCloseDelayMs);
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    id: string
  ) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    cancelClose();
    openReason.current = "keyboard";
    setOpenId(id);

    window.requestAnimationFrame(() => {
      const links = panelRefs.current
        .get(id)
        ?.querySelectorAll<HTMLAnchorElement>("a[href]");
      const target =
        event.key === "ArrowUp"
          ? links?.item((links?.length ?? 1) - 1)
          : links?.item(0);
      target?.focus();
    });
  }

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia(NAVBAR_DESKTOP_MEDIA_QUERY);
    const handleChange = () => setOpenId(null);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!openId) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpenId(null);
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [openId]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    []
  );

  return (
    <nav
      ref={rootRef}
      className="bs-nav-desktop-nav"
      aria-label={navigationConfig.accessibility.desktopLabel}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openId) {
          event.preventDefault();
          closeMenu(true);
        }
      }}
    >
      <ul className="bs-nav-desktop-list">
        {navigationConfig.items.map((item) => {
          const active = isNavigationActive(pathname, item.href);
          const menu = item.megaMenu;

          if (!menu) {
            return (
              <li key={item.id} className="bs-nav-desktop-item">
                <NavigationLink
                  href={item.href}
                  external={item.external}
                  className="bs-nav-top-link"
                  aria-current={active ? "page" : undefined}
                  onClick={() => closeMenu()}
                  onFocus={() => closeMenu()}
                >
                  {item.label}
                </NavigationLink>
              </li>
            );
          }

          const isOpen = openId === item.id;
          const menuId = `${baseId}-${item.id}-panel`;
          const triggerId = `${baseId}-${item.id}-trigger`;

          return (
            <li
              key={item.id}
              className="bs-nav-desktop-item"
              onPointerEnter={(event) => {
                cancelClose();
                if (
                  navigationConfig.behavior.openOnHover &&
                  event.pointerType === "mouse" &&
                  openId !== item.id
                ) {
                  openReason.current = "hover";
                  setOpenId(item.id);
                }
              }}
              onPointerLeave={() => scheduleClose(item.id)}
            >
              <button
                ref={(node) => {
                  if (node) triggerRefs.current.set(item.id, node);
                  else triggerRefs.current.delete(item.id);
                }}
                id={triggerId}
                type="button"
                className="bs-nav-top-link bs-nav-dropdown-trigger"
                aria-expanded={isOpen}
                aria-controls={menuId}
                data-active={active || undefined}
                onClick={(event) => {
                  cancelClose();
                  // A first mouse click should not undo the preceding hover-open.
                  if (openReason.current === "hover" && event.detail > 0) {
                    openReason.current = "click";
                    // Hover and click can be batched before a render commits.
                    setOpenId(item.id);
                    return;
                  }
                  openReason.current = openId === item.id ? null : "click";
                  setOpenId((current) =>
                    current === item.id ? null : item.id
                  );
                }}
                onKeyDown={(event) => handleTriggerKeyDown(event, item.id)}
              >
                {item.label}
                {navigationConfig.behavior.showDropdownChevron && (
                  <ChevronDown aria-hidden="true" className="bs-nav-chevron" />
                )}
              </button>

              <div
                ref={(node) => {
                  if (node) panelRefs.current.set(item.id, node);
                  else panelRefs.current.delete(item.id);
                }}
                id={menuId}
                className="bs-nav-mega-positioner"
                hidden={!isOpen}
                role="region"
                aria-labelledby={triggerId}
              >
                <div className="bs-nav-mega-shell">
                  <div
                    className="bs-nav-mega-grid"
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(menu.groups.length, 1)}, minmax(0, 1fr))`,
                    }}
                  >
                    {menu.groups.map((group) => (
                      <section
                        key={group.id}
                        className="bs-nav-mega-group"
                        aria-labelledby={`${menuId}-${group.id}-heading`}
                      >
                        <h2
                          id={`${menuId}-${group.id}-heading`}
                          className="bs-nav-group-heading"
                        >
                          {group.label}
                        </h2>
                        <ul className="bs-nav-group-list">
                          {group.links.map((link) => {
                            const external = isExternalLink(
                              link.href,
                              link.external
                            );
                            return (
                              <li key={link.id}>
                                <NavigationLink
                                  href={link.href}
                                  external={link.external}
                                  className="bs-nav-mega-link"
                                  aria-current={
                                    !external &&
                                    isNavigationActive(pathname, link.href)
                                      ? "page"
                                      : undefined
                                  }
                                  onClick={() => closeMenu()}
                                >
                                  {link.icon && (
                                    <span className="bs-nav-link-icon">
                                      <NavigationIcon name={link.icon} />
                                    </span>
                                  )}
                                  <span className="bs-nav-link-copy">
                                    <span className="bs-nav-link-title">
                                      {link.label}
                                    </span>
                                    {link.description && (
                                      <span className="bs-nav-link-description">
                                        {link.description}
                                      </span>
                                    )}
                                  </span>
                                  {external ? (
                                    <ArrowUpRight
                                      aria-hidden="true"
                                      className="bs-nav-external-arrow"
                                    />
                                  ) : (
                                    <ArrowRight
                                      aria-hidden="true"
                                      className="bs-nav-link-arrow"
                                    />
                                  )}
                                </NavigationLink>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>

                  <div className="bs-nav-mega-footer">
                    <p className="bs-nav-footer-copy">
                      <span className="bs-nav-footer-badge">
                        {menu.footer.badge}
                      </span>
                      <span>{menu.footer.text}</span>
                    </p>
                    <NavigationLink
                      href={menu.footer.link.href}
                      external={menu.footer.link.external}
                      className="bs-nav-footer-link"
                      onClick={() => closeMenu()}
                    >
                      {menu.footer.link.label}
                      <ArrowRight aria-hidden="true" />
                    </NavigationLink>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
