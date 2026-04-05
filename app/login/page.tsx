"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import { useUser } from "@/src/lib/useUser";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";
import { getSiteUrl, AUTH_CALLBACK_PATH } from "@/app/lib/siteUrl";

const UCF_EMAIL_SUFFIX = "@ucf.edu";

function isUcfEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(UCF_EMAIL_SUFFIX);
}

const labelStyle = {
  marginBottom: "0.25rem",
  display: "block",
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.mutedForeground,
};

const PP_NEXT_PATH_KEY = "pp_next_path";
const PP_SECURITY_POPUP_SEEN_KEY = "pp_security_popup_seen";

/** Allow only relative app paths (no open redirect). Returns path or "". */
function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "";
  const path = next.trim();
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  return "";
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextPath = safeNextPath(nextParam);
  const { user, loading: authLoading } = useUser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canResendConfirm, setCanResendConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);

  // Persist next across email verification so /auth/callback can redirect there
  useEffect(() => {
    if (typeof window === "undefined" || !nextPath) return;
    try {
      window.sessionStorage.setItem(PP_NEXT_PATH_KEY, nextPath);
    } catch {
      // ignore
    }
  }, [nextPath]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const go = async () => {
      const supabase = getSupabase();
      let destination = nextPath || "/survey";
      if (!nextPath) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        destination = !profile ? "/profile" : "/survey";
      }
      if (!cancelled) {
        router.replace(destination);
        router.refresh();
      }
    };
    void go();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, nextPath, router]);

  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    try {
      const seen = window.sessionStorage.getItem(PP_SECURITY_POPUP_SEEN_KEY);
      if (!seen) {
        setShowSecurityPopup(true);
        window.sessionStorage.setItem(PP_SECURITY_POPUP_SEEN_KEY, "1");
      }
    } catch {
      setShowSecurityPopup(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setCanResendConfirm(false);

    if (mode === "up" && !agreedToTerms) {
      setError("Please agree to the Terms and Conditions to continue.");
      return;
    }

    if (!isUcfEmail(email)) {
      setError("Only UCF email addresses (@ucf.edu) are allowed.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      let userId: string | undefined;
      if (mode === "in") {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (err) throw err;
        userId = data.user?.id;
      } else {
        // Prefer runtime origin while developing so callback matches localhost vs 127.0.0.1 correctly.
        const runtimeOrigin =
          typeof window !== "undefined" && window.location?.origin
            ? window.location.origin
            : "";
        const siteOrigin = runtimeOrigin || getSiteUrl();
        const redirectTo = siteOrigin ? `${siteOrigin}${AUTH_CALLBACK_PATH}` : undefined;
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });
        if (err) throw err;
        userId = data.user?.id;
        if (!data.session) {
          setMode("in");
          setNotice("Sign up successful. Check your email to confirm, then sign in.");
          setCanResendConfirm(true);
          return;
        }
      }
      let destination = nextPath || "/survey";
      if (!nextPath && userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();
        destination = !profile ? "/profile" : "/survey";
      }
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const supabase = getSupabase();
      const runtimeOrigin =
        typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : "";
      const siteOrigin = runtimeOrigin || getSiteUrl();
      const emailRedirectTo = siteOrigin ? `${siteOrigin}${AUTH_CALLBACK_PATH}` : undefined;
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });
      if (resendErr) throw resendErr;
      setNotice("Confirmation email sent. Check inbox/spam and open the newest link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend confirmation email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await getSupabase().auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PageLayout>
        <Section maxWidth="28rem">
          <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading…</p>
        </Section>
      </PageLayout>
    );
  }

  if (user) {
    return (
      <PageLayout>
        <Section maxWidth="28rem">
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Log in</h1>}
          subtitle={<p className="text-center text-base text-zinc-600">Signed in. Redirecting…</p>}
        />
        <Card glow>
            <p className="mb-4 text-base" style={{ color: colors.mutedForeground }}>Signed in as {user.email}</p>
            {error && (
              <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button href="/survey">Continue</Button>
            <Button variant="secondary" onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out…" : "Sign out"}
            </Button>
          </div>
          </Card>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section maxWidth="28rem">
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>{mode === "in" ? "Log in" : "Sign up"}</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>Use your UCF email to get started.</p>}
        />
        <Card glow>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowSecurityPopup(true)}
              style={{
                fontSize: typography.fontSize.xs,
                color: "#ffd3e5",
                border: "1px solid rgba(255, 140, 175, 0.3)",
                background: "rgba(255, 122, 162, 0.08)",
                padding: "0.35rem 0.65rem",
                borderRadius: 999,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Privacy & Security
            </button>
          </div>
          {notice && (
            <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ borderColor: "rgba(34, 197, 94, 0.35)", backgroundColor: "rgba(34, 197, 94, 0.12)", color: "#86efac" }}>
              {notice}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ucf.edu"
                required
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === "up" && (
              <label
                htmlFor="terms"
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.75rem 0.9rem",
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                }}
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  style={{
                    marginTop: "0.25rem",
                    accentColor: "#ff7aa2",
                    width: 18,
                    height: 18,
                  }}
                />
                <span style={{ color: colors.mutedForeground, fontSize: typography.fontSize.sm, lineHeight: 1.5 }}>
                  I agree to{" "}
                  <Link
                    href="/terms-and-conditions"
                    style={{
                      color: "#ff9ec3",
                      textDecoration: "underline",
                      fontWeight: typography.fontWeight.medium,
                    }}
                    onClick={() => setError(null)}
                  >
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={loading || (mode === "up" && !agreedToTerms)}
              >
                {loading ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setMode((m) => (m === "in" ? "up" : "in")); setError(null); setNotice(null); }}
              >
                {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
              {canResendConfirm && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend confirmation email"}
                </Button>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
              <Link
                href="/forgot-password"
                style={{
                  color: colors.primary,
                  textDecoration: "underline",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </Card>
      </Section>
      {showSecurityPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Security and privacy notice"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(7, 4, 14, 0.62)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
          onClick={() => setShowSecurityPopup(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "30rem",
              borderRadius: "1rem",
              border: "1px solid rgba(255, 140, 175, 0.28)",
              background: "linear-gradient(145deg, rgba(35, 19, 45, 0.95), rgba(25, 13, 34, 0.95))",
              boxShadow: "0 22px 55px rgba(0, 0, 0, 0.45)",
              padding: "1rem 1rem 1.1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p
                style={{
                  margin: 0,
                  fontSize: "1.03rem",
                  fontWeight: typography.fontWeight.semibold,
                  color: "#ffe4ef",
                }}
              >
                Your privacy matters
              </p>
              <button
                type="button"
                onClick={() => setShowSecurityPopup(false)}
                aria-label="Close security notice"
                style={{
                  border: "1px solid rgba(255, 140, 175, 0.3)",
                  background: "rgba(255, 122, 162, 0.08)",
                  color: "#ffd3e5",
                  borderRadius: 999,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <p className="text-sm" style={{ margin: 0, color: colors.mutedForeground, lineHeight: 1.6 }}>
              We do not use your UCF email for anything beyond account access and essential app communication.
              Pegasus Pair does not store or view your plain-text password, and our team has no direct access to
              passwords you choose. You can use any secure password you want. We take security and privacy seriously.
            </p>
            <div className="mt-4 flex justify-end">
              <Button type="button" size="sm" onClick={() => setShowSecurityPopup(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <Section maxWidth="28rem">
            <p className="text-center text-base" style={{ color: colors.mutedForeground }}>Loading…</p>
          </Section>
        </PageLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
