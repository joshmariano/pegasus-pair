"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Supabase sometimes redirects email confirmation to the Site URL root with
 * ?code= (PKCE) or #access_token= (implicit) instead of /auth/callback.
 * Forward to /auth/callback so we can exchange tokens and persist the session.
 */
export default function AuthEmailRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLikelyLanding =
      pathname === "/" || pathname === "/login";
    if (!isLikelyLanding) return;

    const { search, hash } = window.location;
    const params = new URLSearchParams(search);
    const hasCode = params.has("code");
    const hasAuthHash =
      hash.includes("access_token") ||
      hash.includes("refresh_token") ||
      (hash.includes("type=") && hash.includes("signup"));

    if (!hasCode && !hasAuthHash) return;

    const dest = `${window.location.origin}/auth/callback${search}${hash}`;
    window.location.replace(dest);
  }, [pathname]);

  return null;
}
