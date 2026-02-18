"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, typography, radius, shadow } from "@/app/styles/design-tokens";
import PegasusLogo from "@/app/components/PegasusLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/profile", label: "Profile" },
  { href: "/survey", label: "Survey" },
  { href: "/matches", label: "Matches" },
  { href: "/invite", label: "Invite" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  return (
    <nav
      style={{
        borderBottom: isHome
          ? "1px solid rgba(255,255,255,0.10)"
          : `1px solid ${colors.border}`,
        backgroundColor: isHome
          ? "rgba(255,255,255,0.04)"
          : colors.surface,
        backdropFilter: isHome ? "blur(18px)" : "blur(16px)",
        WebkitBackdropFilter: isHome ? "blur(18px)" : "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "4rem",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: colors.foreground,
            fontWeight: typography.fontWeight.semibold,
            fontFamily: typography.fontSerif,
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: radius.lg,
                  textDecoration: "none",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: isActive ? colors.primary : colors.mutedForeground,
                  backgroundColor: isActive
                    ? "rgba(244, 63, 94, 0.16)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.14)"
                    : "1px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
