// Keep this breakpoint in sync with the media query in navbar.css.
export const NAVBAR_DESKTOP_MEDIA_QUERY = "(min-width: 960px)";

export type NavigationIconName =
  "terminal" | "path" | "community" | "contribute" | "platform" | "source";

export interface NavigationLinkItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: NavigationIconName;
  /** HTTP links open in a new tab by default. Set explicitly to override. */
  external?: boolean;
}

export interface NavigationGroup {
  id: string;
  label: string;
  /** Hide groups that would repeat the primary page links on mobile. */
  showOnMobile?: boolean;
  links: NavigationLinkItem[];
}

export interface NavigationMegaMenu {
  groups: NavigationGroup[];
  footer: {
    badge: string;
    text: string;
    link: NavigationLinkItem;
  };
}

export interface NavigationItem extends NavigationLinkItem {
  megaMenu?: NavigationMegaMenu;
}

export interface NavigationConfig {
  brand: {
    name: string;
    href: string;
    accessibleLabel: string;
    /** Optional local image, e.g. "/logos/backspaces.svg" from public/logos/. */
    logoSrc?: string;
  };
  accessibility: {
    desktopLabel: string;
    mobileLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    externalLinkHint: string;
  };
  behavior: {
    openOnHover: boolean;
    hoverCloseDelayMs: number;
    showDropdownChevron: boolean;
  };
  mobile: {
    primaryGroupLabel: string;
    footerText: string;
  };
  items: NavigationItem[];
}

// Change these destinations here; you do not need to edit a component.
const PLATFORM_URL = "https://backspaces-one.vercel.app/";
const SOURCE_URL = "https://github.com/Backspaces-devs/backspaces-landing";

export const navigationConfig: NavigationConfig = {
  brand: {
    name: "backspaces",
    href: "/",
    accessibleLabel: "Backspaces home",
    // logoSrc: "/logos/backspaces.svg",
  },
  accessibility: {
    desktopLabel: "Main navigation",
    mobileLabel: "Backspaces navigation",
    openMenuLabel: "Open navigation menu",
    closeMenuLabel: "Close navigation menu",
    externalLinkHint: "opens in a new tab",
  },
  behavior: {
    openOnHover: true,
    hoverCloseDelayMs: 160,
    showDropdownChevron: true,
  },
  mobile: {
    primaryGroupLabel: "Explore",
    footerText: "A space for students who learn by building.",
  },
  items: [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About", href: "/about" },
    {
      id: "discover",
      label: "Discover",
      href: "/discover",
      megaMenu: {
        groups: [
          {
            id: "products",
            label: "Products",
            links: [
              {
                id: "backspaces-shell",
                label: "Backspaces Shell",
                description: "Product 01",
                icon: "terminal",
                // Temporary destination: replace with the exact product URL.
                href: PLATFORM_URL,
                external: true,
              },
              {
                id: "open-path",
                label: "Open Path",
                description: "Product 02",
                icon: "path",
                // Temporary destination: replace with the exact product URL.
                href: PLATFORM_URL,
                external: true,
              },
            ],
          },
          {
            id: "community",
            label: "Community",
            showOnMobile: false,
            links: [
              {
                id: "about-backspaces",
                label: "About Backspaces",
                description: "Get to know the community.",
                icon: "community",
                href: "/about",
              },
              {
                id: "get-involved",
                label: "Contribute",
                description: "Find your way to get involved.",
                icon: "contribute",
                href: "/contribute",
              },
            ],
          },
          {
            id: "resources",
            label: "Resources",
            links: [
              {
                id: "community-platform",
                label: "Community platform",
                description: "Visit the existing Backspaces platform.",
                icon: "platform",
                href: PLATFORM_URL,
                external: true,
              },
              {
                id: "source-code",
                label: "Source code",
                description: "Explore the landing-page repository.",
                icon: "source",
                href: SOURCE_URL,
                external: true,
              },
            ],
          },
        ],
        footer: {
          badge: "BACKSPACES",
          text: "Build something. Grow together.",
          link: {
            id: "discover-overview",
            label: "Explore Backspaces",
            href: "/discover",
          },
        },
      },
    },
    { id: "contribute", label: "Contribute", href: "/contribute" },
  ],
};
