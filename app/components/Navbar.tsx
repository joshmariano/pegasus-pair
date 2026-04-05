"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { colors, typography, radius, shadow } from "@/app/styles/design-tokens";
import PegasusLogo from "@/app/components/PegasusLogo";
import Button from "@/app/components/ui/Button";
import { AnimatedTabBar } from "@/app/components/ui/AnimatedTabBar";
import { useUser } from "@/src/lib/useUser";
import { getSupabase } from "@/src/lib/supabaseClient";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/profile", label: "Profile" },
  { href: "/survey", label: "Survey" },
  { href: "/matches", label: "Matches" },
  { href: "/invite", label: "Invite" },
];

function HomeIcon() {
  return (
    <svg className="pp-tabbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20H4v-9.5z" />
      <path d="M9.25 20v-5.5h5.5V20" />
    </svg>
  );
}

function SurveyIcon() {
  return (
    <svg className="pp-tabbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 4.5h10a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z" />
      <path d="M9.5 9.5h7M9.5 13h7M9.5 16.5h5" />
    </svg>
  );
}

function MatchesIcon() {
  return (
    <svg className="pp-tabbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 19.4l-1.1-1C6.7 14.6 4 12.2 4 9a4 4 0 0 1 7-2.6A4 4 0 0 1 18 9c0 3.2-2.7 5.6-6.9 9.4l-1.1 1z" />
    </svg>
  );
}

function InviteIcon() {
  return (
    <svg className="pp-tabbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.5 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM17.5 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      <path d="M3.5 19v-1.1A4.4 4.4 0 0 1 7.9 13.5h1.2A4.4 4.4 0 0 1 13.5 17.9V19" />
      <path d="M10.5 13.8a4.5 4.5 0 0 1 3-1.1h1.2a4.4 4.4 0 0 1 4.3 4.3V19" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="pp-tabbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
      <path d="M4 20.2a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileTabs = [
    { href: "/", label: "Home", color: "#ff9ec3", icon: <HomeIcon /> },
    { href: "/survey", label: "Survey", color: "#ff7aa2", icon: <SurveyIcon /> },
    { href: "/matches", label: "Matches", color: "#db58aa", icon: <MatchesIcon /> },
    { href: "/invite", label: "Invite", color: "#c084fc", icon: <InviteIcon /> },
    {
      href: user ? "/profile" : "/login",
      label: user ? "Profile" : "Login",
      color: "#ffb7cf",
      icon: <ProfileIcon />,
    },
  ];

  const mobileActiveIndex = mobileTabs.findIndex((tab) =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  );

  useEffect(() => {
    void Promise.resolve().then(() => setMobileNavOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const closeIfDesktop = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", closeIfDesktop);
    closeIfDesktop();
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  return (
    <nav
      className="navbar-root"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)",
        borderBottom: isHome
          ? "1px solid rgba(255,255,255,0.10)"
          : `1px solid ${colors.border}`,
        backgroundColor: scrolled
          ? "rgba(7,7,10,0.70)"
          : isHome
            ? "rgba(255,255,255,0.04)"
            : colors.surface,
        backdropFilter: isHome ? "blur(18px)" : "blur(16px)",
        WebkitBackdropFilter: isHome ? "blur(18px)" : "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* UCF top bar (4px) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #ff7aa2 0%, #db58aa 55%, #8b5cf6 100%)",
          zIndex: 60,
        }}
      />
      <div
        className="navbar-inner-row"
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: scrolled ? "3.25rem" : "4rem",
        }}
      >
        <Link
          href="/"
          className="brand-apple"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: colors.foreground,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          <span
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: radius.lg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: shadow.avatar,
            }}
          >
            <PegasusLogo width={36} height={36} />
          </span>
          Pegasus Pair
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            flexWrap: "wrap",
            maxWidth: "100%",
            minWidth: 0,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          className="navbar-links max-w-full flex flex-wrap gap-2 sm:gap-3 overflow-x-auto"
        >
          <div className="navbar-links-desktop" style={{ display: "flex", gap: "0.5rem" }}>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}

            <Button href="/terms-and-conditions" size="sm" variant="primary" className="home-pink-pill navbar-terms-btn">
              T&amp;C
            </Button>
          </div>
          {/* Desktop auth status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginLeft: "0.5rem",
              paddingLeft: "0.5rem",
              borderLeft: isHome ? "1px solid rgba(255,255,255,0.10)" : `1px solid ${colors.border}`,
              flex: "0 0 auto",
            }}
            className="navbar-auth-desktop"
          >
            {loading ? (
              <span className="text-xs" style={{ color: colors.mutedForeground }}>…</span>
            ) : user ? (
              <>
                <span
                  className="text-xs"
                  style={{
                    maxWidth: "14rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: colors.mutedForeground,
                  }}
                  title={user.email ?? undefined}
                >
                  {user.email}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await getSupabase().auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <span className="text-xs" style={{ color: colors.mutedForeground }}>Not signed in</span>
            )}
          </div>

          {/* Mobile: quick CTA + menu toggle */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.5rem",
              flex: "0 0 auto",
            }}
            className="navbar-auth-mobile"
          >
            {loading ? (
              <span className="text-xs" style={{ color: colors.mutedForeground }}>…</span>
            ) : user ? (
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  await getSupabase().auth.signOut();
                  window.location.href = "/";
                }}
                className="home-pink-pill"
              >
                Log out
              </Button>
            ) : (
              <Button href="/login" size="sm" variant="primary" className="home-pink-pill">
                Sign Up Free
              </Button>
            )}
            <button
              type="button"
              className="navbar-menu-btn"
              aria-expanded={mobileNavOpen}
              aria-controls="navbar-mobile-menu"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <span className="navbar-menu-icon" aria-hidden>
                <span className={mobileNavOpen ? "navbar-menu-bar open" : "navbar-menu-bar"} />
                <span className={mobileNavOpen ? "navbar-menu-bar open" : "navbar-menu-bar"} />
                <span className={mobileNavOpen ? "navbar-menu-bar open" : "navbar-menu-bar"} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <>
          <div
            className="navbar-mobile-backdrop"
            aria-hidden="true"
            onClick={() => setMobileNavOpen(false)}
            role="presentation"
          />
          <div
            id="navbar-mobile-menu"
            className="navbar-mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="navbar-mobile-menu-title"
          >
            <p id="navbar-mobile-menu-title" className="navbar-mobile-panel-title">
              Menu
            </p>
            <div className="navbar-mobile-links">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`navbar-mobile-link ${isActive ? "navbar-mobile-link-active" : ""}`}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/terms-and-conditions"
                className={`navbar-mobile-link ${pathname === "/terms-and-conditions" ? "navbar-mobile-link-active" : ""}`}
                onClick={() => setMobileNavOpen(false)}
              >
                Terms &amp; Conditions
              </Link>
            </div>
            {!loading && user && (
              <p className="navbar-mobile-email" title={user.email ?? undefined}>
                {user.email}
              </p>
            )}
          </div>
        </>
      )}
      <div className="navbar-mobile-tabbar">
        <AnimatedTabBar
          items={mobileTabs}
          activeIndex={mobileActiveIndex >= 0 ? mobileActiveIndex : 0}
          onTabChange={(index) => {
            const next = mobileTabs[index]?.href;
            if (!next || next === pathname) return;
            setMobileNavOpen(false);
            router.push(next);
          }}
        />
      </div>
    </nav>
  );
}
