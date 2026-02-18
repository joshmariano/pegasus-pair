"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/src/lib/supabaseClient";
import { useUser } from "@/src/lib/useUser";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";

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

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isUcfEmail(email)) {
      setError("Only UCF email addresses (@ucf.edu) can sign up or sign in.");
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
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (err) throw err;
        userId = data.user?.id;
        const inviteCode = typeof window !== "undefined" ? window.sessionStorage.getItem("pegasus_pair_invite_code") : null;
        if (inviteCode?.trim()) {
          await supabase.rpc("increment_invite_use", { code_param: inviteCode.trim() });
          try {
            window.sessionStorage.removeItem("pegasus_pair_invite_code");
          } catch {
            // ignore
          }
        }
      }
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (!profile) {
          router.push("/profile");
        } else {
          router.push("/survey");
        }
      } else {
        router.push("/survey");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          subtitle={<p className="text-center text-base text-zinc-600">You’re all set.</p>}
        />
        <Card glow>
            <p className="mb-4 text-base" style={{ color: colors.mutedForeground }}>Signed in as {user.email}</p>
            {error && (
              <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
              {error}
            </p>
          )}
          <Button variant="secondary" onClick={handleSignOut} disabled={loading}>
            {loading ? "Signing out…" : "Sign out"}
          </Button>
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
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setMode((m) => (m === "in" ? "up" : "in")); setError(null); }}
          >
            {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </form>
        </Card>
      </Section>
    </PageLayout>
  );
}
