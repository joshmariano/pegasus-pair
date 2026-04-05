"use client";

import { useState } from "react";
import Link from "next/link";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";
import { getSupabase } from "@/src/lib/supabaseClient";
import { getEmailRedirectOrigin } from "@/app/lib/siteUrl";

const UCF_EMAIL_SUFFIX = "@ucf.edu";

function isUcfEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(UCF_EMAIL_SUFFIX);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isUcfEmail(email)) {
      setError("Use your UCF email address (@ucf.edu).");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const origin = getEmailRedirectOrigin();
      const redirectTo = origin ? `${origin}/reset-password` : undefined;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        redirectTo ? { redirectTo } : undefined
      );

      if (resetError) throw resetError;

      // Supabase will send the email if the account exists (but we don't reveal which).
      setMessage("If that account exists, you’ll receive a password reset email shortly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Section maxWidth="28rem">
        <PageHeader
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Reset password</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>We’ll email you a reset link if the account exists.</p>}
        />

        <Card glow>
          {error && (
            <p
              className="mb-4 rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: colors.destructive, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}
            >
              {error}
            </p>
          )}

          {message && (
            <p
              className="mb-4 rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: "rgba(34, 197, 94, 0.35)", backgroundColor: "rgba(34, 197, 94, 0.12)", color: "#86efac" }}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" style={{ marginBottom: "0.25rem", display: "block", fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.mutedForeground }}>
                Email
              </label>
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

            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send reset email"}
            </Button>

            <div className="text-center" style={{ marginTop: "0.5rem" }}>
              <Link href="/login" className="underline" style={{ color: colors.mutedForeground }}>
                Back to login
              </Link>
            </div>
          </form>
        </Card>
      </Section>
    </PageLayout>
  );
}

