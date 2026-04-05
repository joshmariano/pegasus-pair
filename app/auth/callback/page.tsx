"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import PageLayout from "@/app/components/ui/PageLayout";
import Section from "@/app/components/ui/Section";
import { colors } from "@/app/styles/design-tokens";
import type { EmailOtpType } from "@supabase/supabase-js";

const PP_NEXT_PATH_KEY = "pp_next_path";

/** Allow only relative app paths (no open redirect). Returns path or "". */
function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "";
  const path = next.trim();
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  return "";
}

/**
 * Auth callback: handles email confirmation links + resumes flow.
 * Reads pp_next_path from sessionStorage (set by /login?next=) and redirects there after profile check; clears it after use.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = getSupabase();

      // Handle all common Supabase callback formats:
      // - PKCE: ?code=...
      // - OTP/email confirm: ?token_hash=...&type=signup
      // - Legacy hash flow: #access_token=...&refresh_token=...
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const rawType = url.searchParams.get("type");
        const validTypes: EmailOtpType[] = [
          "signup",
          "invite",
          "magiclink",
          "recovery",
          "email_change",
          "email",
        ];
        const otpType = validTypes.includes(rawType as EmailOtpType)
          ? (rawType as EmailOtpType)
          : null;

        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            setStatus("error");
            setErrorText(exErr.message);
            return;
          }
          // Clear one-time code from URL so refresh doesn’t retry a stale code
          window.history.replaceState(null, "", `${url.pathname}${url.hash}`);
        } else if (tokenHash && otpType) {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (otpErr) {
            setStatus("error");
            setErrorText(otpErr.message);
            return;
          }
        } else if (window.location.hash.includes("access_token")) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hash.get("access_token");
          const refresh_token = hash.get("refresh_token");
          if (access_token && refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setErr) {
              setStatus("error");
              setErrorText(setErr.message);
              return;
            }
            window.history.replaceState(null, "", url.pathname);
          }
        }
      } catch {
        // fall through to session check
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setStatus("error");
        setErrorText(error.message);
        return;
      }
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setStatus("done");
        let destination: string;
        if (!profile) {
          destination = "/profile";
        } else {
          let nextPath = "";
          try {
            if (typeof window !== "undefined") {
              nextPath = safeNextPath(window.sessionStorage.getItem(PP_NEXT_PATH_KEY));
              window.sessionStorage.removeItem(PP_NEXT_PATH_KEY);
            }
          } catch {
            // ignore
          }
          destination = nextPath || "/survey";
        }
        router.refresh();
        router.replace(destination);
      } else {
        setStatus("error");
        setErrorText("Could not establish a session from this link. It may be expired or missing redirect settings.");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <PageLayout>
      <Section maxWidth="28rem">
        {status === "loading" && (
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>
            Signing you in…
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-base" style={{ color: colors.destructive }}>
            Something went wrong. {errorText ? `${errorText} ` : ""}Try <a href="/login" className="underline">logging in</a> again.
          </p>
        )}
      </Section>
    </PageLayout>
  );
}
