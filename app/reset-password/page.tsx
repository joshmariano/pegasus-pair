"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/app/components/ui/Section";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import PageHeader from "@/app/components/ui/PageHeader";
import PageLayout from "@/app/components/ui/PageLayout";
import { colors, typography } from "@/app/styles/design-tokens";
import { getSupabase } from "@/src/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newPassword || newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();

      // If the reset link has been opened, @supabase/ssr's browser client
      // will detect the session from the URL and allow updateUser().
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage("Password updated. Redirecting to login…");
      setTimeout(() => router.push("/login"), 1200);
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
          title={<h1 className="text-center text-3xl font-bold" style={{ fontFamily: typography.fontSerif, color: colors.foreground }}>Set new password</h1>}
          subtitle={<p className="text-center text-base" style={{ color: colors.mutedForeground }}>Enter a new password to finish the reset.</p>}
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
              <label htmlFor="new_password" style={{ marginBottom: "0.25rem", display: "block", fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.mutedForeground }}>
                New password
              </label>
              <Input
                id="new_password"
                type="password"
                name="new_password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Card>
      </Section>
    </PageLayout>
  );
}

